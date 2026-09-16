'use client';
import { useWorkspaceAgents } from './WorkspaceAgents';
import { agentConfiguration } from '@/lib/preview-records';
import { hybridAgents } from '@/lib/hybrid-data';
import { useState } from 'react';
import { Button } from '../UI';
import { usePreview, identifier, roles, type Policy } from './PreviewState';
import { JourneyHeader, Field, Feedback, Dialog, Tabs, Panel } from './Shared';
const tabs = [
  'Users & roles',
  'Policies',
  'Approvals',
  'Data classifications',
  'Audit',
];
export default function Governance({
  initialTab = 'Approvals',
}: {
  initialTab?: string;
}) {
  const hybridAgents = useWorkspaceAgents();
  const { state, update } = usePreview();
  const [tab, setTab] = useState(initialTab);
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[6]);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  return (
    <div className="surfacePage hybridPage operationalEditor">
      <JourneyHeader
        title="Governance"
        description="Explore access, policy decisions and approval evidence in one workspace."
      />
      <Feedback message={message} />
      <Tabs names={tabs} current={tab} onChange={setTab} />
      <Panel names={tabs} current={tab}>
        {tab === 'Users & roles' && (
          <>
            <Button onClick={() => setInvite(true)}>Invite user preview</Button>
            <div className="surfaceCards">
              {state.users.map((u) => (
                <article className="agentCard" key={u.id}>
                  <h2>{u.name}</h2>
                  <p>{u.email}</p>
                  <span className="tag">{u.state}</span>
                  <Field label={`Role for ${u.email}`}>
                    <select
                      value={u.role}
                      onChange={(e) => {
                        update((s) => ({
                          ...s,
                          users: s.users.map((v) =>
                            v.id === u.id ? { ...v, role: e.target.value } : v,
                          ),
                          audit: [
                            `Role updated for ${u.email} · preview`,
                            ...s.audit,
                          ],
                        }));
                        setMessage('Role updated in the preview.');
                      }}
                    >
                      {roles.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                </article>
              ))}
            </div>
          </>
        )}
        {tab === 'Policies' && (
          <>
            <Button
              onClick={() =>
                setPolicy({
                  id: '',
                  name: '',
                  scope: 'Workspace',
                  approval: true,
                  description: '',
                })
              }
            >
              Create policy preview
            </Button>
            <div className="surfaceCards">
              {state.policies.map((p) => (
                <article className="agentCard" key={p.id}>
                  <h2>{p.name}</h2>
                  <p>{p.scope}</p>
                  <p>{p.description}</p>
                  <p>{p.approval ? 'Approval required' : 'Advisory'}</p>
                  <Button variant="outline" onClick={() => setPolicy(p)}>
                    Edit policy
                  </Button>
                </article>
              ))}
            </div>
            <p>
              Policy edits are illustrative. The deployment preview always
              requires approval.
            </p>
          </>
        )}
        {tab === 'Approvals' && (
          <>
            <h2>Deployment approvals</h2>
            <Field label="Review note">
              <textarea
                maxLength={2000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Explain your decision"
              />
            </Field>
            {!state.releases.some((r) => r.state === 'Pending approval') && (
              <p>No pending requests. Create a promotion in Deployments.</p>
            )}
            <div className="surfaceCards">
              {state.releases
                .filter((r) => r.state === 'Pending approval')
                .map((r) => (
                  <article className="agentCard" key={r.id}>
                    <h3>
                      {r.version} → {r.target}
                    </h3>
                    <p>
                      {
                        hybridAgents.find(
                          (a) => a.id === (r.agentId || 'customer-service'),
                        )?.name
                      }{' '}
                      · {r.runId}
                    </p>
                    <p>Reviewer: you · simulated role</p>
                    {(['Active', 'Rejected'] as const).map((next) => (
                      <Button
                        key={next}
                        variant={next === 'Active' ? 'primary' : 'outline'}
                        disabled={!note.trim()}
                        onClick={() => {
                          const run = state.runs.find((v) => v.id === r.runId);
                          if (
                            next === 'Active' &&
                            (!run?.passed ||
                              (run.configuration &&
                                run.configuration !==
                                  agentConfiguration(
                                    state.ui,
                                    r.agentId || 'customer-service',
                                  )))
                          ) {
                            setMessage(
                              'Configuration changed. Run a new evaluation before approving this release.',
                            );
                            return;
                          }
                          const failed =
                            next === 'Active' &&
                            state.ui?.[`release:${r.id}:outcome`] === 'failure';
                          update((s) => ({
                            ...s,
                            ui:
                              next === 'Active' &&
                              !failed &&
                              r.target === 'Production'
                                ? {
                                    ...s.ui,
                                    [`agent:${r.agentId || 'customer-service'}:draft`]: false,
                                    [`agent:${r.agentId || 'customer-service'}:saved`]: false,
                                  }
                                : s.ui,
                            releases: s.releases.map((v) =>
                              v.id === r.id
                                ? {
                                    ...v,
                                    state: failed ? 'Failed' : next,
                                    reason: note.trim(),
                                  }
                                : !failed &&
                                    v.state === 'Active' &&
                                    v.target === r.target &&
                                    (v.agentId || 'customer-service') ===
                                      (r.agentId || 'customer-service') &&
                                    next === 'Active'
                                  ? { ...v, state: 'Rolled back' }
                                  : v,
                            ),
                            audit: [
                              `${next === 'Active' ? 'Approved' : 'Rejected'} ${r.version} → ${r.target}: ${note.trim()} · preview`,
                              ...s.audit,
                            ],
                          }));
                          setMessage(
                            failed
                              ? 'Approved, but the deployment health check failed. No traffic changed. Open Deployments to recover.'
                              : next === 'Active'
                                ? 'Approved. The release is active in Deployments preview.'
                                : 'Request rejected in the preview.',
                          );
                          setNote('');
                        }}
                      >
                        {next === 'Active'
                          ? 'Approve preview'
                          : 'Reject preview'}
                      </Button>
                    ))}
                  </article>
                ))}
            </div>
          </>
        )}
        {tab === 'Data classifications' && (
          <div className="surfaceCards">
            {['Public', 'Internal', 'Confidential'].map((c) => (
              <article className="agentCard" key={c}>
                <h2>{c}</h2>
                <p>
                  Illustrative classification. Assign approved labels to model
                  endpoints and review resource permissions.
                </p>
                <a href="/models">Review model classifications →</a>
              </article>
            ))}
          </div>
        )}
        {tab === 'Audit' && (
          <>
            <h2>Preview activity</h2>
            {state.audit.length ? (
              <ol className="journeyList">
                {state.audit.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            ) : (
              <p>No preview changes recorded yet.</p>
            )}
          </>
        )}
      </Panel>
      {invite && (
        <Dialog title="Invite user preview" onClose={() => setInvite(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                state.users.some(
                  (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
                )
              ) {
                setMessage('This email already exists in the preview.');
                return;
              }
              update((s) => ({
                ...s,
                users: [
                  ...s.users,
                  {
                    id: identifier(),
                    name: email.trim().split('@')[0],
                    email: email.trim(),
                    role,
                    state: 'Invitation simulated',
                  },
                ],
                audit: [
                  `Invitation simulated for ${email.trim()} · no email sent`,
                  ...s.audit,
                ],
              }));
              setInvite(false);
              setEmail('');
              setMessage('Invitation simulated. No email was sent.');
            }}
          >
            <Field label="Email">
              <input
                required
                type="email"
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Role">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Button type="submit">Simulate invitation</Button>
          </form>
        </Dialog>
      )}
      {policy && (
        <Dialog title="Policy configuration" onClose={() => setPolicy(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const p = { ...policy, id: policy.id || identifier() };
              update((s) => ({
                ...s,
                policies: s.policies.some((v) => v.id === p.id)
                  ? s.policies.map((v) => (v.id === p.id ? p : v))
                  : [...s.policies, p],
                audit: [`Policy saved: ${p.name} · preview`, ...s.audit],
              }));
              setPolicy(null);
              setMessage('Policy saved in the preview.');
            }}
          >
            <Field label="Policy name">
              <input
                required
                maxLength={120}
                value={policy.name}
                onChange={(e) => setPolicy({ ...policy, name: e.target.value })}
              />
            </Field>
            <Field label="Scope">
              <select
                value={policy.scope}
                onChange={(e) =>
                  setPolicy({ ...policy, scope: e.target.value })
                }
              >
                <option>Organization</option>
                <option>Workspace</option>
              </select>
            </Field>
            <Field label="Description">
              <textarea
                required
                maxLength={2000}
                value={policy.description}
                onChange={(e) =>
                  setPolicy({ ...policy, description: e.target.value })
                }
              />
            </Field>
            <label className="resourceCheck">
              <input
                type="checkbox"
                checked={policy.approval}
                onChange={(e) =>
                  setPolicy({ ...policy, approval: e.target.checked })
                }
              />
              Approval required
            </label>
            <Button
              type="submit"
              disabled={!policy.name.trim() || !policy.description.trim()}
            >
              Save policy preview
            </Button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
