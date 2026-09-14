import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { readDrafts, storeDraft } from '../server/drafts';
import { createDraft } from '../lib/launch';
import {
  createAgent,
  listAgents,
  updateAgent,
} from '../server/agent-repository';

test('PostgreSQL policies isolate clients and workspaces, default to no access and enforce write grants', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      await readFile(
        new URL('../db/migrations/001_platform.sql', import.meta.url),
        'utf8',
      ),
    );
    await db.exec(
      await readFile(
        new URL(
          '../db/migrations/002_identity_and_drafts.sql',
          import.meta.url,
        ),
        'utf8',
      ),
    );
    const [{ id: orgA }, { id: orgB }] = (
      await db.query<{ id: string }>(
        "INSERT INTO newneo.organizations(name) VALUES ('A'), ('B') RETURNING id",
      )
    ).rows;
    const workspace = async (org: string, name: string) =>
      (
        await db.query<{ id: string }>(
          'INSERT INTO newneo.workspaces(organization_id,name) VALUES ($1,$2) RETURNING id',
          [org, name],
        )
      ).rows[0].id;
    const wa = await workspace(orgA, 'A1'),
      wa2 = await workspace(orgA, 'A2'),
      wb = await workspace(orgB, 'B1');
    const [{ id: editor }, { id: reader }] = (
      await db.query<{ id: string }>(
        "INSERT INTO newneo.identities(issuer,subject) VALUES ('https://issuer.test','editor'), ('https://issuer.test','reader') RETURNING id",
      )
    ).rows;
    await db.query(
      'INSERT INTO newneo.workspace_memberships VALUES ($1,$2,$3,true), ($1,$2,$4,false)',
      [orgA, wa, editor, reader],
    );
    await db.exec(
      'CREATE ROLE newneo_test_runtime; GRANT USAGE ON SCHEMA newneo TO newneo_test_runtime; GRANT SELECT ON newneo.workspace_memberships TO newneo_test_runtime; GRANT SELECT, INSERT, UPDATE ON newneo.agents TO newneo_test_runtime; GRANT SELECT,INSERT,UPDATE ON newneo.drafts TO newneo_test_runtime; GRANT SELECT ON newneo.identities,newneo.workspaces TO newneo_test_runtime; SET ROLE newneo_test_runtime',
    );
    assert.equal(
      (await db.query('SELECT * FROM newneo.identities')).rows.length,
      0,
    );
    await db.query(
      "SELECT set_config('newneo.issuer','https://issuer.test',false),set_config('newneo.subject','editor',false)",
    );
    assert.equal(
      (await db.query('SELECT * FROM newneo.identities')).rows.length,
      1,
    );
    const scope = { organizationId: orgA, workspaceId: wa };
    assert.deepEqual(await listAgents(db, scope), []);
    await assert.rejects(createAgent(db, scope, 'No identity', ''));
    await db.query("SELECT set_config('newneo.identity_id', $1, false)", [
      editor,
    ]);
    assert.equal(
      (await db.query('SELECT * FROM newneo.workspaces')).rows.length,
      1,
    );
    const saved = await storeDraft(db, scope, createDraft('customer-service'));
    assert.equal((await readDrafts(db, scope)).length, 1);
    await assert.rejects(
      storeDraft(db, { organizationId: orgB, workspaceId: wb }, createDraft()),
    );
    await assert.rejects(
      storeDraft(db, { organizationId: orgA, workspaceId: wa2 }, createDraft()),
    );
    const changed = await storeDraft(
      db,
      scope,
      { ...createDraft(), name: 'Revised' },
      saved.id,
      1,
    );
    assert.equal(changed.revision, 2);
    await assert.rejects(storeDraft(db, scope, createDraft(), saved.id, 1));
    const agent = await createAgent(db, scope, 'Support', 'Customer support');
    assert.equal((await listAgents(db, scope)).length, 1);
    await assert.rejects(
      createAgent(
        db,
        { organizationId: orgB, workspaceId: wb },
        'Other client',
        '',
      ),
    );
    await assert.rejects(
      createAgent(
        db,
        { organizationId: orgA, workspaceId: wa2 },
        'Other workspace',
        '',
      ),
    );
    const revised = await updateAgent(
      db,
      scope,
      agent.id,
      1,
      'Support v2',
      'Updated',
    );
    assert.equal(revised.revision, 2);
    await assert.rejects(
      updateAgent(db, scope, agent.id, 1, 'Stale overwrite', ''),
      /revision conflict/,
    );
    await db.query("SELECT set_config('newneo.identity_id', $1, false)", [
      reader,
    ]);
    assert.equal((await readDrafts(db, scope)).length, 1);
    await assert.rejects(storeDraft(db, scope, createDraft()));
    await assert.rejects(storeDraft(db, scope, createDraft(), saved.id, 2));
    assert.equal((await listAgents(db, scope))[0].name, 'Support v2');
    await assert.rejects(
      updateAgent(db, scope, agent.id, 2, 'Unauthorized edit', ''),
      /unavailable/,
    );
    await assert.rejects(createAgent(db, scope, 'Unauthorized create', ''));
    await db.query("SELECT set_config('newneo.identity_id', '', false)");
    assert.deepEqual(await listAgents(db, scope), []);
    assert.deepEqual(await readDrafts(db, scope), []);
    await db.exec('BEGIN');
    await db.query("SELECT set_config('newneo.identity_id',$1,true)", [editor]);
    assert.equal((await readDrafts(db, scope)).length, 1);
    await db.exec('COMMIT');
    assert.equal((await readDrafts(db, scope)).length, 0);
  } finally {
    await db.close();
  }
});
