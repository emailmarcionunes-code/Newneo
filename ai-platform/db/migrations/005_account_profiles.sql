ALTER TABLE newneo.identities ADD COLUMN display_name text CHECK (length(display_name) <= 254);
ALTER TABLE newneo.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY member_organization ON newneo.organizations FOR SELECT USING (
 EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=organizations.id
 AND m.identity_id=nullif(current_setting('newneo.identity_id',true),'')::uuid)
);
GRANT SELECT ON newneo.organizations TO newneo_app;
