CREATE SCHEMA newneo;
CREATE TABLE newneo.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE newneo.identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issuer, subject)
);
CREATE TABLE newneo.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES newneo.organizations(id),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id)
);
-- Memberships are provisioned by a trusted administrative process, never by
-- trusting organization IDs or roles supplied by a browser or an OIDC claim.
CREATE TABLE newneo.workspace_memberships (
  organization_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  identity_id uuid NOT NULL REFERENCES newneo.identities(id),
  can_edit_agents boolean NOT NULL DEFAULT false,
  PRIMARY KEY (organization_id, workspace_id, identity_id),
  FOREIGN KEY (organization_id, workspace_id) REFERENCES newneo.workspaces(organization_id, id)
);
CREATE TABLE newneo.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 2000),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (organization_id, workspace_id) REFERENCES newneo.workspaces(organization_id, id),
  UNIQUE (organization_id, workspace_id, id)
);
CREATE INDEX agents_workspace ON newneo.agents(organization_id, workspace_id);

-- Transaction-local identity must come from the verified server session.
-- The runtime role must not own these tables or have BYPASSRLS/superuser rights.
ALTER TABLE newneo.workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.workspace_memberships FORCE ROW LEVEL SECURITY;
CREATE POLICY own_memberships ON newneo.workspace_memberships FOR SELECT
  USING (identity_id = nullif(current_setting('newneo.identity_id', true), '')::uuid);
ALTER TABLE newneo.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.agents FORCE ROW LEVEL SECURITY;
CREATE POLICY read_agents ON newneo.agents FOR SELECT USING (
  EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id = agents.organization_id
    AND m.workspace_id = agents.workspace_id AND m.identity_id = nullif(current_setting('newneo.identity_id', true), '')::uuid)
);
CREATE POLICY create_agents ON newneo.agents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id = agents.organization_id
    AND m.workspace_id = agents.workspace_id AND m.can_edit_agents
    AND m.identity_id = nullif(current_setting('newneo.identity_id', true), '')::uuid)
);
CREATE POLICY edit_agents ON newneo.agents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id = agents.organization_id
    AND m.workspace_id = agents.workspace_id AND m.can_edit_agents
    AND m.identity_id = nullif(current_setting('newneo.identity_id', true), '')::uuid)
) WITH CHECK (
  EXISTS (SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id = agents.organization_id
    AND m.workspace_id = agents.workspace_id AND m.can_edit_agents
    AND m.identity_id = nullif(current_setting('newneo.identity_id', true), '')::uuid)
);
-- No delete policy: deleting agents is outside this foundation milestone.
