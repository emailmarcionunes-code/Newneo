'use client';
import { useState } from 'react';
import { endpointsFor, type RuntimeSelection } from '@/lib/configuration';
import { Button, SelectField } from './UI';
const providers = [
  {
    id: 'OpenAI',
    name: 'OpenAI',
    family: 'GPT',
    description: 'Explore the organization’s existing GPT endpoint.',
    focus: 'Existing GPT-4o reference configuration',
    url: 'https://platform.openai.com/docs/models',
  },
  {
    id: 'Anthropic',
    name: 'Anthropic / Claude',
    family: 'Claude',
    description: 'Compare Claude families for reasoning and agent workflows.',
    focus:
      'Sonnet: balance of speed and intelligence. Haiku: faster tasks. Opus: complex agentic work.',
    url: 'https://platform.claude.com/docs/en/models/overview',
  },
  {
    id: 'Google',
    name: 'Google / Gemini',
    family: 'Gemini',
    description: 'Explore Gemini for multimodal and reasoning tasks.',
    focus: 'Pro: complex reasoning. Flash: speed and efficiency.',
    url: 'https://ai.google.dev/gemini-api/docs/models',
  },
];
export function ProviderModelStep({
  value,
  onChange,
}: {
  value: RuntimeSelection;
  onChange: (v: RuntimeSelection) => void;
}) {
  const endpoints = endpointsFor(value.executionModel);
  const selected = endpoints.find((e) => e.id === value.endpointId);
  const [provider, setProvider] = useState(selected?.provider ?? 'OpenAI');
  const details = providers.find((p) => p.id === provider)!;
  const choices = endpoints.filter((e) => e.provider === provider);
  const endpoint = choices.find((e) => e.id === value.endpointId);
  return (
    <section className="providerModelStep" aria-label="Model selection">
      <p className="modelPreviewNotice">
        Interactive preview · provider availability and model versions must be
        approved by your organization. No provider is contacted.
      </p>
      <div className="providerModelColumns">
        <div>
          <div className="providerCardGrid">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                className="executionCard"
                aria-pressed={provider === p.id}
                onClick={() => setProvider(p.id)}
              >
                <span className="providerWordmark">{p.family}</span>
                <strong>{p.name}</strong>
                <span>{p.description}</span>
                <span>
                  {selected?.provider === p.id
                    ? 'Selected model'
                    : 'View models and differences →'}
                </span>
              </button>
            ))}
          </div>
          <section className="providerDetails">
            <h3>{details.name}</h3>
            <p>{details.focus}</p>
            <a href={details.url} target="_blank" rel="noreferrer">
              Official model comparison ↗
            </a>
            <SelectField
              id="approved-model"
              label="Approved model"
              value={endpoint?.id ?? ''}
              disabled={!choices.length}
              onChange={(e) =>
                onChange({ ...value, endpointId: e.target.value })
              }
            >
              <option value="">Select a model</option>
              {choices.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </SelectField>
            {!choices.length ? (
              <p role="status">
                No approved endpoint is available for this infrastructure in the
                preview. Return to Infra and choose Customer Cloud.
              </p>
            ) : (
              !endpoint && (
                <Button
                  onClick={() =>
                    onChange({ ...value, endpointId: choices[0].id })
                  }
                >
                  Select {details.family} preview
                </Button>
              )
            )}
            <dl className="modelMetrics">
              <div>
                <dt>Capabilities</dt>
                <dd>{details.focus}</dd>
              </div>
              <div>
                <dt>Cost and speed</dt>
                <dd>
                  {endpoint
                    ? `${endpoint.estimatedCost} · ${endpoint.expectedLatency}`
                    : 'Select a model to inspect its reference values.'}
                </dd>
              </div>
              <div>
                <dt>Context window</dt>
                <dd>
                  {endpoint?.contextWindow ??
                    'Depends on selected model version'}
                </dd>
              </div>
            </dl>
            <p>
              Provider families are not directly ranked. Compare quality and
              cost on your own tasks in Evaluate.
            </p>
            <details className="advancedSettings">
              <summary>Advanced settings (optional)</summary>
              <p>Demo organization and workspace</p>
              <p>
                Pricing, context and availability depend on model version,
                region and endpoint. Displayed estimates are sample values, not
                live quotes.
              </p>
            </details>
          </section>
        </div>
        <aside className="providerSelection">
          <h3>Selected configuration</h3>
          <dl className="surfaceFacts">
            <div>
              <dt>Infrastructure</dt>
              <dd>
                {value.executionModel === 'organization-default'
                  ? 'Customer Cloud · organization default'
                  : value.executionModel}
              </dd>
            </div>
            <div>
              <dt>Provider</dt>
              <dd>{selected?.provider ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{selected?.name ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{selected?.region ?? 'Not configured'}</dd>
            </div>
          </dl>
          <p>
            Browsing a provider keeps your current model until you select
            another.
          </p>
        </aside>
      </div>
    </section>
  );
}
