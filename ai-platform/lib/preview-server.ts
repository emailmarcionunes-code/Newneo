import { getTemplate } from './catalog';
import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { parseDraft, type LaunchDraft } from './launch';
import { parseGovernance, parseRuntime, runtimeIsReady } from './configuration';
import { environments, sampleAnswer, sampleQuestion } from './preview';

// Preview-only signing key. Restarting the process expires preview receipts.
// This module must only be imported by server routes and domain tests.
const key = randomBytes(32);
const ttl = 10 * 60 * 1000;
function fingerprint(draft: LaunchDraft) {
  const {
    step: _step,
    savedAt: _savedAt,
    environment: _environment,
    ...configuration
  } = draft;
  return createHash('sha256')
    .update(JSON.stringify(configuration))
    .digest('hex');
}
function sign(payload: string) {
  return createHmac('sha256', key).update(payload).digest('base64url');
}
function receipt(draft: LaunchDraft, now: number) {
  const payload = Buffer.from(
    JSON.stringify({
      scope: 'reference-evaluation',
      hash: fingerprint(draft),
      expires: now + ttl,
    }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
function verify(token: unknown, draft: LaunchDraft, now: number) {
  if (typeof token !== 'string' || token.length > 2048) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const actual = Buffer.from(signature),
    expected = Buffer.from(sign(payload));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return false;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return (
      value.scope === 'reference-evaluation' &&
      value.hash === fingerprint(draft) &&
      value.expires > now
    );
  } catch {
    return false;
  }
}
function validDraft(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const raw = value as LaunchDraft;
  if (
    typeof raw.templateId !== 'string' ||
    getTemplate(raw.templateId).id !== raw.templateId ||
    !parseRuntime(raw.runtime) ||
    !parseGovernance(raw.governance)
  )
    return null;
  const draft = parseDraft(JSON.stringify(value), raw.templateId);
  if (
    !draft ||
    !draft.name.trim() ||
    !draft.description.trim() ||
    draft.name.length > 120 ||
    draft.description.length > 2000 ||
    !runtimeIsReady(draft.runtime)
  )
    return null;
  // Reject invalid resource IDs instead of silently treating them as approved.
  if (
    JSON.stringify(draft.knowledge) !== JSON.stringify(raw.knowledge) ||
    JSON.stringify(draft.tools) !== JSON.stringify(raw.tools)
  )
    return null;
  return draft;
}
export function handlePreview(body: unknown, now = Date.now()) {
  const fail = (status: number, error: string) => ({ status, data: { error } });
  if (!body || typeof body !== 'object')
    return fail(400, 'Invalid preview request.');
  const input = body as Record<string, unknown>;
  if (input.mode !== 'preview')
    return fail(
      403,
      'Live execution is unavailable. This endpoint only supports previews.',
    );
  if (!['evaluate', 'chat', 'deploy'].includes(String(input.action)))
    return fail(400, 'Unknown preview action.');
  const draft = validDraft(input.draft);
  if (!draft)
    return fail(
      400,
      'Review your use case, approved resources, model and governance settings before continuing.',
    );
  if (input.action === 'evaluate')
    return {
      status: 200,
      data: {
        mode: 'preview',
        token: receipt(draft, now),
        score: 92,
        metrics: [
          { name: 'Relevance', value: 96 },
          { name: 'Groundedness', value: 90 },
          { name: 'Safety', value: 98 },
          { name: 'Tool Success', value: 88 },
        ],
        cases: [
          { status: 'Passed', count: 46 },
          { status: 'Needs review', count: 3 },
          { status: 'Failed', count: 1 },
        ],
      },
    };
  if (input.action === 'chat') {
    if (
      typeof input.message !== 'string' ||
      !input.message.trim() ||
      input.message.length > 1000
    )
      return fail(400, 'Enter a message of up to 1,000 characters.');
    return {
      status: 200,
      data: {
        mode: 'preview',
        answer:
          input.message.trim() === sampleQuestion
            ? sampleAnswer
            : 'This is a demo conversation. No model or connected system was called. Try the reference question: Where is my order #12345?',
      },
    };
  }
  if (!environments.some((item) => item.name === input.environment))
    return fail(400, 'Select an environment.');
  if (!verify(input.token, draft, now))
    return fail(
      409,
      'Load the reference evaluation again. Your configuration changed or the preview expired.',
    );
  // No runtime adapter is called. A preview receipt is NEVER a production approval.
  return {
    status: 200,
    data: {
      mode: 'preview',
      deployed: false,
      agentName: draft.name,
      environment: input.environment,
    },
  };
}
