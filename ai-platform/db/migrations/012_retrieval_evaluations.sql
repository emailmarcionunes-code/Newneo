CREATE TABLE newneo.retrieval_suites (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL,workspace_id uuid NOT NULL,
 agent_version_id uuid NOT NULL,actor_id uuid NOT NULL REFERENCES newneo.identities(id),
 name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 100),
 cases jsonb NOT NULL CHECK(jsonb_typeof(cases)='array' AND jsonb_array_length(cases) BETWEEN 1 AND 10),
 created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id,agent_version_id) REFERENCES newneo.agent_versions(organization_id,workspace_id,id));
CREATE TABLE newneo.retrieval_evaluations (
 id uuid PRIMARY KEY,organization_id uuid NOT NULL,workspace_id uuid NOT NULL,suite_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id),
 results jsonb NOT NULL CHECK(jsonb_typeof(results)='array' AND jsonb_array_length(results) BETWEEN 1 AND 10),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id,suite_id) REFERENCES newneo.retrieval_suites(organization_id,workspace_id,id));
CREATE INDEX retrieval_evaluations_scope ON newneo.retrieval_evaluations(organization_id,workspace_id,created_at DESC);
ALTER TABLE newneo.retrieval_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.retrieval_suites FORCE ROW LEVEL SECURITY;
ALTER TABLE newneo.retrieval_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.retrieval_evaluations FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.retrieval_suites FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=retrieval_suites.organization_id AND m.workspace_id=retrieval_suites.workspace_id));
CREATE POLICY author_insert ON newneo.retrieval_suites FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id) AND actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE POLICY member_read ON newneo.retrieval_evaluations FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=retrieval_evaluations.organization_id AND m.workspace_id=retrieval_evaluations.workspace_id));
CREATE POLICY operator_insert ON newneo.retrieval_evaluations FOR INSERT WITH CHECK(newneo.can_run_sources(organization_id,workspace_id) AND actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
GRANT SELECT,INSERT ON newneo.retrieval_suites,newneo.retrieval_evaluations TO newneo_app;
