CREATE TABLE IF NOT EXISTS newneo.agent_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 created_by uuid NOT NULL REFERENCES newneo.identities(id), brief jsonb NOT NULL CHECK(jsonb_typeof(brief)='object'),
 status text NOT NULL DEFAULT 'Pending review' CHECK(status IN ('Pending review','Reviewed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES newneo.workspaces(organization_id,id)
);
ALTER TABLE newneo.agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.agent_requests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_agent_requests ON newneo.agent_requests;
CREATE POLICY read_agent_requests ON newneo.agent_requests FOR SELECT USING (
 EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=agent_requests.organization_id AND m.workspace_id=agent_requests.workspace_id)
);
DROP POLICY IF EXISTS create_agent_requests ON newneo.agent_requests;
CREATE POLICY create_agent_requests ON newneo.agent_requests FOR INSERT WITH CHECK (
 newneo.can_author(organization_id,workspace_id) AND created_by=nullif(current_setting('newneo.identity_id',true),'')::uuid
);
GRANT SELECT,INSERT ON newneo.agent_requests TO newneo_app;
