CREATE FUNCTION newneo.can_run_sources(org uuid,ws uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
SELECT EXISTS(SELECT 1 FROM newneo.workspace_memberships WHERE organization_id=org AND workspace_id=ws AND role IN ('Org Admin','AI Platform Admin','AI Engineer','Operator','Reviewer / Approver')) $$;
REVOKE ALL ON FUNCTION newneo.can_run_sources(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION newneo.can_run_sources(uuid,uuid) TO newneo_app;
CREATE TABLE newneo.source_runs (
 id uuid PRIMARY KEY,organization_id uuid NOT NULL,workspace_id uuid NOT NULL,agent_version_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id),query text NOT NULL CHECK(length(trim(query)) BETWEEN 1 AND 200),
 request_hash text NOT NULL,result jsonb NOT NULL CHECK(jsonb_typeof(result)='array' AND jsonb_array_length(result)<=5),
 duration_ms integer NOT NULL CHECK(duration_ms>=0),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id,agent_version_id) REFERENCES newneo.agent_versions(organization_id,workspace_id,id));
CREATE INDEX source_runs_scope ON newneo.source_runs(organization_id,workspace_id,created_at DESC);
ALTER TABLE newneo.source_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.source_runs FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.source_runs FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=source_runs.organization_id AND m.workspace_id=source_runs.workspace_id));
CREATE POLICY operator_insert ON newneo.source_runs FOR INSERT WITH CHECK(newneo.can_run_sources(organization_id,workspace_id) AND actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
GRANT SELECT,INSERT ON newneo.source_runs TO newneo_app;
CREATE TABLE newneo.configuration_checks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL,workspace_id uuid NOT NULL,agent_version_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id),checks jsonb NOT NULL CHECK(jsonb_typeof(checks)='array'),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id,agent_version_id) REFERENCES newneo.agent_versions(organization_id,workspace_id,id));
CREATE INDEX configuration_checks_scope ON newneo.configuration_checks(organization_id,workspace_id,created_at DESC);
ALTER TABLE newneo.configuration_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.configuration_checks FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.configuration_checks FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=configuration_checks.organization_id AND m.workspace_id=configuration_checks.workspace_id));
CREATE POLICY reviewer_insert ON newneo.configuration_checks FOR INSERT WITH CHECK(newneo.can_run_sources(organization_id,workspace_id) AND actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
GRANT SELECT,INSERT ON newneo.configuration_checks TO newneo_app;
