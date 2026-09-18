ALTER TABLE newneo.agents ADD COLUMN archived_at timestamptz;
ALTER TABLE newneo.skills ADD COLUMN archived_at timestamptz;
ALTER TABLE newneo.registry_audit ALTER COLUMN version_id DROP NOT NULL;
ALTER TABLE newneo.registry_audit DROP CONSTRAINT registry_audit_action_check;
ALTER TABLE newneo.registry_audit ADD CHECK(action IN ('created','version-created','archived','restored'));
CREATE TABLE newneo.knowledge_bindings (
 organization_id uuid NOT NULL,workspace_id uuid NOT NULL,agent_version_id uuid NOT NULL,document_id uuid NOT NULL,
 PRIMARY KEY(agent_version_id,document_id),
 FOREIGN KEY(organization_id,workspace_id,agent_version_id) REFERENCES newneo.agent_versions(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id,document_id) REFERENCES newneo.knowledge_documents(organization_id,workspace_id,id));
ALTER TABLE newneo.knowledge_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.knowledge_bindings FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.knowledge_bindings FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=knowledge_bindings.organization_id AND m.workspace_id=knowledge_bindings.workspace_id));
CREATE POLICY author_insert ON newneo.knowledge_bindings FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id));
GRANT SELECT,INSERT ON newneo.knowledge_bindings TO newneo_app;
CREATE INDEX knowledge_bindings_scope ON newneo.knowledge_bindings(organization_id,workspace_id);
