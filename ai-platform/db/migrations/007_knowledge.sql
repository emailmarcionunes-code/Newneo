CREATE TABLE newneo.knowledge_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 160), body text NOT NULL CHECK(octet_length(body) BETWEEN 1 AND 20000),
 checksum text NOT NULL, created_by uuid NOT NULL REFERENCES newneo.identities(id), created_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
 search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple',title || ' ' || body)) STORED,
 UNIQUE(organization_id,workspace_id,id), UNIQUE(organization_id,workspace_id,checksum),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES newneo.workspaces(organization_id,id));
CREATE INDEX knowledge_scope ON newneo.knowledge_documents(organization_id,workspace_id,created_at DESC);
CREATE INDEX knowledge_search ON newneo.knowledge_documents USING gin(search_vector);
ALTER TABLE newneo.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.knowledge_documents FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.knowledge_documents FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=knowledge_documents.organization_id AND m.workspace_id=knowledge_documents.workspace_id));
CREATE POLICY author_insert ON newneo.knowledge_documents FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id) AND created_by=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE POLICY author_archive ON newneo.knowledge_documents FOR UPDATE USING(newneo.can_author(organization_id,workspace_id)) WITH CHECK(newneo.can_author(organization_id,workspace_id));
GRANT SELECT,INSERT ON newneo.knowledge_documents TO newneo_app;
GRANT UPDATE(archived_at) ON newneo.knowledge_documents TO newneo_app;
CREATE TABLE newneo.knowledge_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL, workspace_id uuid NOT NULL, document_id uuid NOT NULL,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id), action text NOT NULL CHECK(action IN ('imported','archived')), created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id,document_id) REFERENCES newneo.knowledge_documents(organization_id,workspace_id,id));
ALTER TABLE newneo.knowledge_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.knowledge_audit FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.knowledge_audit FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=knowledge_audit.organization_id AND m.workspace_id=knowledge_audit.workspace_id));
CREATE POLICY author_insert ON newneo.knowledge_audit FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id) AND actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid);
GRANT SELECT,INSERT ON newneo.knowledge_audit TO newneo_app;
CREATE INDEX knowledge_audit_scope ON newneo.knowledge_audit(organization_id,workspace_id,created_at DESC);
