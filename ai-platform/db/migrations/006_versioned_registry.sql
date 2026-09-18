ALTER TABLE newneo.workspace_memberships ADD COLUMN role text NOT NULL DEFAULT 'Read Only' CHECK (role IN ('Org Admin','AI Platform Admin','AI Engineer','Business Owner','Operator','Reviewer / Approver','Read Only'));
UPDATE newneo.workspace_memberships SET role='AI Engineer' WHERE can_edit_agents;
CREATE FUNCTION newneo.can_author(org uuid, ws uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
SELECT EXISTS (SELECT 1 FROM newneo.workspace_memberships WHERE organization_id=org AND workspace_id=ws AND identity_id=nullif(current_setting('newneo.identity_id',true),'')::uuid AND can_edit_agents AND role IN ('Org Admin','AI Platform Admin','AI Engineer')) $$;
CREATE TABLE newneo.skills (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120), description text NOT NULL DEFAULT '' CHECK(length(description)<=2000),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,workspace_id,id), FOREIGN KEY(organization_id,workspace_id) REFERENCES newneo.workspaces(organization_id,id));
CREATE TABLE newneo.agent_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL, agent_id uuid NOT NULL,
 number integer NOT NULL CHECK(number>0), configuration jsonb NOT NULL CHECK(jsonb_typeof(configuration)='object'),
 created_by uuid NOT NULL REFERENCES newneo.identities(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,workspace_id,agent_id,number), UNIQUE(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id,agent_id) REFERENCES newneo.agents(organization_id,workspace_id,id));
CREATE TABLE newneo.skill_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL, skill_id uuid NOT NULL,
 number integer NOT NULL CHECK(number>0), configuration jsonb NOT NULL CHECK(jsonb_typeof(configuration)='object'),
 created_by uuid NOT NULL REFERENCES newneo.identities(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,workspace_id,skill_id,number), UNIQUE(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id,skill_id) REFERENCES newneo.skills(organization_id,workspace_id,id));
CREATE TABLE newneo.skill_bindings (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, agent_version_id uuid NOT NULL, skill_version_id uuid NOT NULL,
 PRIMARY KEY(agent_version_id,skill_version_id),
 FOREIGN KEY(organization_id,workspace_id,agent_version_id) REFERENCES newneo.agent_versions(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id,skill_version_id) REFERENCES newneo.skill_versions(organization_id,workspace_id,id));
CREATE TABLE newneo.registry_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id), kind text NOT NULL CHECK(kind IN ('agent','skill')),
 resource_id uuid NOT NULL, version_id uuid NOT NULL, action text NOT NULL CHECK(action IN ('created','version-created')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES newneo.workspaces(organization_id,id));
ALTER TABLE newneo.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.skills FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.skills FOR SELECT USING (EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=skills.organization_id AND m.workspace_id=skills.workspace_id));
CREATE POLICY author_insert ON newneo.skills FOR INSERT WITH CHECK (newneo.can_author(organization_id,workspace_id));
CREATE INDEX skills_scope ON newneo.skills(organization_id,workspace_id);
GRANT SELECT,INSERT ON newneo.skills TO newneo_app;
ALTER TABLE newneo.agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.agent_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.agent_versions FOR SELECT USING (EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=agent_versions.organization_id AND m.workspace_id=agent_versions.workspace_id));
CREATE POLICY author_insert ON newneo.agent_versions FOR INSERT WITH CHECK (newneo.can_author(organization_id,workspace_id) AND created_by=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE INDEX agent_versions_scope ON newneo.agent_versions(organization_id,workspace_id);
GRANT SELECT,INSERT ON newneo.agent_versions TO newneo_app;
ALTER TABLE newneo.skill_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.skill_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.skill_versions FOR SELECT USING (EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=skill_versions.organization_id AND m.workspace_id=skill_versions.workspace_id));
CREATE POLICY author_insert ON newneo.skill_versions FOR INSERT WITH CHECK (newneo.can_author(organization_id,workspace_id) AND created_by=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE INDEX skill_versions_scope ON newneo.skill_versions(organization_id,workspace_id);
GRANT SELECT,INSERT ON newneo.skill_versions TO newneo_app;
ALTER TABLE newneo.skill_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.skill_bindings FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.skill_bindings FOR SELECT USING (EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=skill_bindings.organization_id AND m.workspace_id=skill_bindings.workspace_id));
CREATE POLICY author_insert ON newneo.skill_bindings FOR INSERT WITH CHECK (newneo.can_author(organization_id,workspace_id));
CREATE INDEX skill_bindings_scope ON newneo.skill_bindings(organization_id,workspace_id);
GRANT SELECT,INSERT ON newneo.skill_bindings TO newneo_app;
ALTER TABLE newneo.registry_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.registry_audit FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.registry_audit FOR SELECT USING (EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=registry_audit.organization_id AND m.workspace_id=registry_audit.workspace_id));
CREATE POLICY author_insert ON newneo.registry_audit FOR INSERT WITH CHECK (newneo.can_author(organization_id,workspace_id) AND actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE INDEX registry_audit_scope ON newneo.registry_audit(organization_id,workspace_id);
GRANT SELECT,INSERT ON newneo.registry_audit TO newneo_app;
CREATE POLICY author_update ON newneo.skills FOR UPDATE USING (newneo.can_author(organization_id,workspace_id)) WITH CHECK (newneo.can_author(organization_id,workspace_id));
GRANT UPDATE ON newneo.skills TO newneo_app;
DROP POLICY create_agents ON newneo.agents;
DROP POLICY edit_agents ON newneo.agents;
CREATE POLICY create_agents ON newneo.agents FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id));
CREATE POLICY edit_agents ON newneo.agents FOR UPDATE USING(newneo.can_author(organization_id,workspace_id)) WITH CHECK(newneo.can_author(organization_id,workspace_id));
DROP POLICY create_drafts ON newneo.drafts;
DROP POLICY update_drafts ON newneo.drafts;
CREATE POLICY create_drafts ON newneo.drafts FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id));
CREATE POLICY update_drafts ON newneo.drafts FOR UPDATE USING(newneo.can_author(organization_id,workspace_id)) WITH CHECK(newneo.can_author(organization_id,workspace_id));
REVOKE UPDATE,DELETE ON newneo.agent_versions,newneo.skill_versions,newneo.skill_bindings,newneo.registry_audit FROM newneo_app;
