import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seal, unseal } from '../server/session-token';
import { readJson } from '../server/http';
import { validatedDraft } from '../server/drafts';
import { createDraft } from '../lib/launch';

test('session encryption rejects tampering, expiry and cross-purpose tokens', () => {
  process.env.SESSION_SECRET = 'a'.repeat(64);
  const token = seal({ subject: 'user-123' }, 'session', Date.now() + 60000);
  assert.deepEqual(unseal(token, 'session'), { subject: 'user-123' });
  assert.equal(unseal(token, 'login'), null);
  const bytes = Buffer.from(token, 'base64url');
  bytes[bytes.length - 1] ^= 1;
  assert.equal(unseal(bytes.toString('base64url'), 'session'), null);
  assert.equal(
    unseal(seal({ subject: 'user-123' }, 'session', Date.now() - 1), 'session'),
    null,
  );
  process.env.SESSION_SECRET = 'b'.repeat(64);
  assert.equal(unseal(token, 'session'), null);
  delete process.env.SESSION_SECRET;
  assert.throws(() => seal({}, 'session', Date.now() + 60000));
});
test('HTTP JSON reader enforces streaming size limit and rejects malformed bodies', async () => {
  assert.deepEqual(
    await readJson(
      new Request('http://localhost', { method: 'POST', body: '{"a":1}' }),
    ),
    { a: 1 },
  );
  await assert.rejects(
    readJson(
      new Request('http://localhost', {
        method: 'POST',
        body: 'a'.repeat(32769),
      }),
    ),
    /too large/,
  );
  await assert.rejects(
    readJson(
      new Request('http://localhost', { method: 'POST', body: 'broken' }),
    ),
  );
});
test('stored configuration does not preserve deployment state or arbitrary keys', () => {
  const draft = validatedDraft({
    ...createDraft('customer-service'),
    environment: 'Production',
    step: 6,
    secret: 'not permitted',
  });
  assert.equal(draft.environment, null);
  assert.ok(draft.step <= 5);
  assert.equal('secret' in draft, false);
  assert.throws(() =>
    validatedDraft({ ...createDraft(), name: 'x'.repeat(121) }),
  );
  assert.throws(() =>
    validatedDraft({ ...createDraft(), templateId: 'unregistered' }),
  );
});
