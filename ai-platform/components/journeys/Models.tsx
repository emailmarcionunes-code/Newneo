'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../UI';
import { usePreview, identifier, type Endpoint } from './PreviewState';
import { JourneyHeader, Dialog, Field, Feedback } from './Shared';
const blank = (): Endpoint => ({
  id: '',
  name: '',
  provider: '',
  url: '',
  runtime: 'Managed AI',
  region: '',
  classification: 'Not assigned',
  status: 'Not tested',
});
export default function Models() {
  const { state, update, ready } = usePreview();
  const [form, setForm] = useState<Endpoint | null>(null);
  const [review, setReview] = useState(false);
  const [selected, setSelected] = useState('default');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('success');
  const detail = state.endpoints.find((e) => e.id === selected);
  function save() {
    if (!form) return;
    const item = {
      ...form,
      id: form.id || identifier(),
      name: form.name.trim(),
      status: 'Not tested',
    };
    update((s) => ({
      ...s,
      endpoints: s.endpoints.some((e) => e.id === item.id)
        ? s.endpoints.map((e) => (e.id === item.id ? item : e))
        : [...s.endpoints, item],
      audit: [`Model configuration saved: ${item.name} · preview`, ...s.audit],
    }));
    setSelected(item.id);
    setForm(null);
    setMessage('Endpoint saved in this preview.');
  }
  return (
    <div className="surfacePage hybridPage operationalEditor">
      <JourneyHeader
        title="Models"
        description="Configure approved endpoints and choose organization and workspace defaults."
      >
        <Button
          disabled={!ready}
          onClick={() => {
            setForm(blank());
            setReview(false);
          }}
        >
          + Add endpoint
        </Button>
      </JourneyHeader>
      <Feedback message={message} />
      <div className="surfaceColumns">
        <div className="modelPrimaryColumn">
          <div className="surfaceCards">
            {state.endpoints.map((e) => (
              <article className="agentCard" key={e.id}>
                <span className="tag">{e.runtime}</span>
                <h2>{e.name}</h2>
                <p>{e.provider}</p>
                <strong>{e.status}</strong>
                <Button variant="link" onClick={() => setSelected(e.id)}>
                  View {e.name}
                </Button>
              </article>
            ))}
          </div>
          <section className="panel">
            <h2>Model defaults</h2>
            <Field label="Organization default">
              <select
                value={state.defaultModel}
                onChange={(e) =>
                  update((s) => ({ ...s, defaultModel: e.target.value }))
                }
              >
                {state.endpoints.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Customer Service workspace override">
              <select
                value={state.workspaceModel}
                onChange={(e) =>
                  update((s) => ({ ...s, workspaceModel: e.target.value }))
                }
              >
                <option value="">Inherit organization default</option>
                {state.endpoints.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <p>
              Effective endpoint:{' '}
              {
                state.endpoints.find(
                  (e) => e.id === (state.workspaceModel || state.defaultModel),
                )?.name
              }
            </p>
            <Link className="button outline" href="/evaluations">
              Continue to Evaluations →
            </Link>
          </section>
        </div>
        <aside className="panel surfaceAside">
          <h2>Endpoint details</h2>
          {detail && (
            <>
              <dl className="surfaceFacts">
                {[
                  ['Model', detail.name],
                  ['Provider', detail.provider],
                  ['Region', detail.region || 'Not specified'],
                  ['Data classification', detail.classification],
                  ['Cost profile', 'Not measured'],
                  ['Performance profile', 'Not measured'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(detail);
                  setReview(false);
                }}
              >
                Edit endpoint
              </Button>
              <Field label="Test scenario">
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  <option value="success">Successful</option>
                  <option value="failure">Endpoint unavailable</option>
                </select>
              </Field>
              <Button
                onClick={() => {
                  update((s) => ({
                    ...s,
                    endpoints: s.endpoints.map((e) =>
                      e.id === detail.id
                        ? {
                            ...e,
                            status:
                              result === 'success'
                                ? 'Ready · preview'
                                : 'Unavailable · preview',
                          }
                        : e,
                    ),
                  }));
                  setMessage(
                    result === 'success'
                      ? 'Connection test succeeded in the preview. No provider was contacted.'
                      : 'Preview failed: endpoint unavailable. Edit the endpoint or retry.',
                  );
                }}
              >
                Test connection preview
              </Button>
            </>
          )}
        </aside>
      </div>
      {form && (
        <Dialog
          title={review ? 'Review endpoint' : 'Configure endpoint'}
          onClose={() => setForm(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              review ? save() : setReview(true);
            }}
          >
            {review ? (
              <dl className="surfaceFacts">
                {[
                  ['Model', form.name],
                  ['Provider', form.provider],
                  ['Runtime', form.runtime],
                  ['Region', form.region],
                  ['Endpoint', form.url || 'Not specified'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <>
                <Field label="Model name">
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
                <Field label="Provider">
                  <input
                    required
                    maxLength={120}
                    value={form.provider}
                    onChange={(e) =>
                      setForm({ ...form, provider: e.target.value })
                    }
                  />
                </Field>
                <Field label="Endpoint URL (example)">
                  <input
                    type="url"
                    maxLength={2048}
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </Field>
                <Field label="Runtime">
                  <select
                    value={form.runtime}
                    onChange={(e) =>
                      setForm({ ...form, runtime: e.target.value })
                    }
                  >
                    {[
                      'Managed AI',
                      'Customer Cloud',
                      'Private AI',
                      'Hybrid AI',
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Region">
                  <input
                    required
                    maxLength={120}
                    value={form.region}
                    onChange={(e) =>
                      setForm({ ...form, region: e.target.value })
                    }
                  />
                </Field>
                <Field label="Approved data classification (sample)">
                  <input
                    maxLength={120}
                    value={form.classification}
                    onChange={(e) =>
                      setForm({ ...form, classification: e.target.value })
                    }
                  />
                </Field>
              </>
            )}
            <p>No API key is required or collected.</p>
            <div className="resourceFooter">
              <Button
                variant="secondary"
                onClick={() => (review ? setReview(false) : setForm(null))}
              >
                {review ? 'Back' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.name.trim() ||
                  !form.provider.trim() ||
                  !form.region.trim()
                }
              >
                {review ? 'Save endpoint preview' : 'Review →'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
