import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { withVerifiedIdentity, closeDatabase } from '../server/database';
import { createDraft } from '../lib/launch';
import { readDrafts, storeDraft } from '../server/drafts';

test(
  'native PostgreSQL pool resolves verified identities and resets tenant context',
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const owner = new Client({
      connectionString: process.env.TEST_DATABASE_URL,
    });
    await owner.connect();
    const issuer = 'https://integration.test';
    const subject = randomUUID();
    const outsider = randomUUID();
    let org: string | undefined;
    let identity: string | undefined;
    let otherIdentity: string | undefined;
    try {
      org = (
        await owner.query(
          "INSERT INTO newneo.organizations(name) VALUES('Integration test') RETURNING id",
        )
      ).rows[0].id;
      const workspace = (
        await owner.query(
          "INSERT INTO newneo.workspaces(organization_id,name) VALUES($1,'Test') RETURNING id",
          [org],
        )
      ).rows[0].id;
      identity = (
        await owner.query(
          'INSERT INTO newneo.identities(issuer,subject) VALUES($1,$2) RETURNING id',
          [issuer, subject],
        )
      ).rows[0].id;
      otherIdentity = (
        await owner.query(
          'INSERT INTO newneo.identities(issuer,subject) VALUES($1,$2) RETURNING id',
          [issuer, outsider],
        )
      ).rows[0].id;
      await owner.query(
        'INSERT INTO newneo.workspace_memberships VALUES($1,$2,$3,true)',
        [org, workspace, identity],
      );
      const scope = { organizationId: org!, workspaceId: workspace };
      const saved = await withVerifiedIdentity({ issuer, subject }, (db) =>
        storeDraft(db, scope, createDraft()),
      );
      assert.equal(saved.revision, 1);
      await assert.rejects(
        withVerifiedIdentity({ issuer, subject: 'unprovisioned' }, (db) =>
          readDrafts(db, scope),
        ),
      );
      const hidden = await withVerifiedIdentity(
        { issuer, subject: outsider },
        (db) => readDrafts(db, scope),
      );
      assert.equal(hidden.length, 0);
      const own = await withVerifiedIdentity({ issuer, subject }, (db) =>
        readDrafts(db, scope),
      );
      assert.equal(own.length, 1);
      await owner.query(
        'UPDATE newneo.workspace_memberships SET can_edit_agents=false WHERE identity_id=$1',
        [identity],
      );
      await assert.rejects(
        withVerifiedIdentity({ issuer, subject }, (db) =>
          storeDraft(db, scope, createDraft(), saved.id, 1),
        ),
      );
    } finally {
      if (org) {
        await owner.query(
          'DELETE FROM newneo.drafts WHERE organization_id=$1',
          [org],
        );
        await owner.query(
          'DELETE FROM newneo.workspace_memberships WHERE organization_id=$1',
          [org],
        );
        await owner.query(
          'DELETE FROM newneo.workspaces WHERE organization_id=$1',
          [org],
        );
        await owner.query('DELETE FROM newneo.organizations WHERE id=$1', [
          org,
        ]);
      }
      if (identity)
        await owner.query('DELETE FROM newneo.identities WHERE id=$1', [
          identity,
        ]);
      if (otherIdentity)
        await owner.query('DELETE FROM newneo.identities WHERE id=$1', [
          otherIdentity,
        ]);
      await owner.end();
      await closeDatabase();
    }
  },
);
