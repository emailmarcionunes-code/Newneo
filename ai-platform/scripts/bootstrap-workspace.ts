import { Client } from 'pg';
async function main() {
  const issuer = process.env.OIDC_ISSUER_URL,
    subject = process.env.BOOTSTRAP_SUBJECT,
    organization = process.env.BOOTSTRAP_ORGANIZATION,
    workspace = process.env.BOOTSTRAP_WORKSPACE;
  if (
    !issuer ||
    !subject ||
    !organization ||
    !workspace ||
    !process.env.MIGRATION_DATABASE_URL
  )
    throw new Error('Missing provisioning settings');
  if (
    new URL(issuer).protocol !== 'https:' ||
    organization.length > 120 ||
    workspace.length > 120
  )
    throw new Error('Invalid provisioning settings');
  const db = new Client({
    connectionString: process.env.MIGRATION_DATABASE_URL,
  });
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query('SELECT pg_advisory_xact_lock(19405,3)');
    // Trusted administrator only; never accept issuer/subject or grants from a web request.
    const identity = (
      await db.query(
        'INSERT INTO newneo.identities(issuer,subject) VALUES($1,$2) ON CONFLICT(issuer,subject) DO UPDATE SET subject=EXCLUDED.subject RETURNING id',
        [issuer, subject],
      )
    ).rows[0];
    // Create a new isolated organization/workspace. Explicitly fail on a repeated name
    // instead of guessing an existing tenant to grant access to.
    if (
      (
        await db.query('SELECT id FROM newneo.organizations WHERE name=$1', [
          organization,
        ])
      ).rows.length
    )
      throw new Error(
        'Organization already exists; provision membership explicitly by UUID',
      );
    const org = (
      await db.query(
        'INSERT INTO newneo.organizations(name) VALUES($1) RETURNING id',
        [organization],
      )
    ).rows[0];
    const ws = (
      await db.query(
        'INSERT INTO newneo.workspaces(organization_id,name) VALUES($1,$2) RETURNING id',
        [org.id, workspace],
      )
    ).rows[0];
    await db.query(
      'INSERT INTO newneo.workspace_memberships(organization_id,workspace_id,identity_id,can_edit_agents) VALUES($1,$2,$3,$4)',
      [org.id, ws.id, identity.id, process.env.BOOTSTRAP_CAN_EDIT === 'true'],
    );
    await db.query('COMMIT');
    console.log(
      'Workspace provisioned. Organization:',
      org.id,
      'Workspace:',
      ws.id,
    );
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}
main().catch(() => {
  console.error(
    'Workspace provisioning failed. Verify settings, administrative privileges and whether the organization already exists.',
  );
  process.exitCode = 1;
});
