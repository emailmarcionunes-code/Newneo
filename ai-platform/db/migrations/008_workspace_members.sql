ALTER TABLE newneo.workspace_memberships ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE newneo.workspace_memberships ADD COLUMN revision integer NOT NULL DEFAULT 1 CHECK(revision>0);
ALTER TABLE newneo.workspace_memberships ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
DROP POLICY own_memberships ON newneo.workspace_memberships;
CREATE POLICY own_memberships ON newneo.workspace_memberships FOR SELECT USING(active AND identity_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE FUNCTION newneo.can_manage_members(org uuid,ws uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT EXISTS(SELECT 1 FROM newneo.workspace_memberships WHERE organization_id=org AND workspace_id=ws AND identity_id=nullif(current_setting('newneo.identity_id',true),'')::uuid AND active AND role='Org Admin') $$;
REVOKE ALL ON FUNCTION newneo.can_manage_members(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION newneo.can_manage_members(uuid,uuid) TO newneo_app;
CREATE TABLE newneo.membership_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL,workspace_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id),member_id uuid NOT NULL REFERENCES newneo.identities(id),
 action text NOT NULL CHECK(action IN ('member-updated','owner-initialized')), details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES newneo.workspaces(organization_id,id));
ALTER TABLE newneo.membership_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.membership_audit FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.membership_audit FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=membership_audit.organization_id AND m.workspace_id=membership_audit.workspace_id));
GRANT SELECT ON newneo.membership_audit TO newneo_app;
CREATE INDEX membership_audit_scope ON newneo.membership_audit(organization_id,workspace_id,created_at DESC);
-- Definer operations expose only a scoped member directory and bounded updates.
-- They independently bind identity_id to the verified issuer/subject context.
CREATE FUNCTION newneo.require_workspace_admin(org uuid,ws uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE actor uuid;
BEGIN
 SELECT i.id INTO actor FROM newneo.identities i JOIN newneo.workspace_memberships m ON m.identity_id=i.id
 WHERE i.id=nullif(current_setting('newneo.identity_id',true),'')::uuid AND i.issuer=current_setting('newneo.issuer',true) AND i.subject=current_setting('newneo.subject',true)
 AND m.organization_id=org AND m.workspace_id=ws AND m.active AND m.role='Org Admin';
 IF actor IS NULL THEN RAISE EXCEPTION 'Workspace administration is not permitted.' USING ERRCODE='42501'; END IF;
 RETURN actor;
END $$;
REVOKE ALL ON FUNCTION newneo.require_workspace_admin(uuid,uuid) FROM PUBLIC;
CREATE FUNCTION newneo.list_workspace_members(org uuid,ws uuid,page_number integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE result jsonb; total bigint;
BEGIN
 PERFORM newneo.require_workspace_admin(org,ws);
 IF page_number IS NULL OR page_number<0 OR page_number>10000 THEN RAISE EXCEPTION 'Invalid page.' USING ERRCODE='22023'; END IF;
 SELECT count(*) INTO total FROM newneo.workspace_memberships WHERE organization_id=org AND workspace_id=ws;
 SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) INTO result FROM (SELECT m.identity_id AS id,coalesce(i.display_name,'Workspace member') AS display_name,m.role,m.active,m.revision,m.updated_at FROM newneo.workspace_memberships m JOIN newneo.identities i ON i.id=m.identity_id WHERE m.organization_id=org AND m.workspace_id=ws ORDER BY m.active DESC,i.display_name NULLS LAST,m.identity_id LIMIT 50 OFFSET page_number*50) r;
 RETURN jsonb_build_object('members',result,'total',total,'page',page_number);
END $$;
REVOKE ALL ON FUNCTION newneo.list_workspace_members(uuid,uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION newneo.list_workspace_members(uuid,uuid,integer) TO newneo_app;
CREATE FUNCTION newneo.change_workspace_member(org uuid,ws uuid,target uuid,expected_revision integer,new_role text,new_active boolean,reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE actor uuid; prior newneo.workspace_memberships%ROWTYPE;
BEGIN
 actor:=newneo.require_workspace_admin(org,ws);
 PERFORM 1 FROM newneo.workspaces WHERE organization_id=org AND id=ws FOR UPDATE;
 actor:=newneo.require_workspace_admin(org,ws);
 IF new_role IS NULL OR new_role NOT IN ('Org Admin','AI Platform Admin','AI Engineer','Business Owner','Operator','Reviewer / Approver','Read Only') OR new_active IS NULL OR reason IS NULL OR length(trim(reason))=0 OR length(reason)>500 THEN RAISE EXCEPTION 'Invalid role, status or reason.' USING ERRCODE='22023'; END IF;
 SELECT * INTO prior FROM newneo.workspace_memberships WHERE organization_id=org AND workspace_id=ws AND identity_id=target FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Member unavailable.' USING ERRCODE='P0002'; END IF;
 IF expected_revision IS NULL OR prior.revision<>expected_revision THEN RAISE EXCEPTION 'Membership changed. Reload before saving.' USING ERRCODE='40001'; END IF;
 IF prior.role=new_role AND prior.active=new_active THEN RETURN jsonb_build_object('id',target,'revision',prior.revision,'changed',false); END IF;
 IF prior.active AND prior.role='Org Admin' AND (NOT new_active OR new_role<>'Org Admin') AND NOT EXISTS(SELECT 1 FROM newneo.workspace_memberships WHERE organization_id=org AND workspace_id=ws AND active AND role='Org Admin' AND identity_id<>target) THEN RAISE EXCEPTION 'Keep at least one active Org Admin.' USING ERRCODE='23514'; END IF;
 UPDATE newneo.workspace_memberships SET role=new_role,active=new_active,can_edit_agents=(new_role IN ('Org Admin','AI Platform Admin','AI Engineer')),revision=revision+1,updated_at=now() WHERE organization_id=org AND workspace_id=ws AND identity_id=target;
 INSERT INTO newneo.membership_audit(organization_id,workspace_id,actor_id,member_id,action,details) VALUES(org,ws,actor,target,'member-updated',jsonb_build_object('previousRole',prior.role,'role',new_role,'previousActive',prior.active,'active',new_active,'reason',trim(reason)));
 RETURN jsonb_build_object('id',target,'revision',prior.revision+1,'changed',true);
END $$;
REVOKE ALL ON FUNCTION newneo.change_workspace_member(uuid,uuid,uuid,integer,text,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION newneo.change_workspace_member(uuid,uuid,uuid,integer,text,boolean,text) TO newneo_app;
