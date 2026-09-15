ALTER TABLE newneo.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.identities FORCE ROW LEVEL SECURITY;
CREATE POLICY verified_identity ON newneo.identities FOR SELECT USING (
 issuer = current_setting('newneo.issuer', true) AND subject = current_setting('newneo.subject', true)
);
ALTER TABLE newneo.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.workspaces FORCE ROW LEVEL SECURITY;
CREATE POLICY member_workspaces ON newneo.workspaces FOR SELECT USING (
 EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.workspace_id=workspaces.id AND m.organization_id=workspaces.organization_id)
);
CREATE TABLE newneo.drafts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL,
 workspace_id uuid NOT NULL,
 template_id text NOT NULL,
 configuration jsonb NOT NULL CHECK (jsonb_typeof(configuration)='object'),
 revision integer NOT NULL DEFAULT 1 CHECK (revision>0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (organization_id,workspace_id) REFERENCES newneo.workspaces(organization_id,id)
);
ALTER TABLE newneo.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.drafts FORCE ROW LEVEL SECURITY;
CREATE POLICY read_drafts ON newneo.drafts FOR SELECT USING (
 EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.workspace_id=drafts.workspace_id AND m.organization_id=drafts.organization_id)
);
CREATE POLICY create_drafts ON newneo.drafts FOR INSERT WITH CHECK (
 EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.workspace_id=drafts.workspace_id AND m.organization_id=drafts.organization_id AND m.can_edit_agents)
);
CREATE POLICY update_drafts ON newneo.drafts FOR UPDATE USING (
 EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.workspace_id=drafts.workspace_id AND m.organization_id=drafts.organization_id AND m.can_edit_agents)
) WITH CHECK (
 EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.workspace_id=drafts.workspace_id AND m.organization_id=drafts.organization_id AND m.can_edit_agents)
);
CREATE INDEX drafts_workspace ON newneo.drafts(organization_id,workspace_id);
