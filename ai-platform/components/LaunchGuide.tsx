'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getTemplate } from '@/lib/catalog';
import {
  approvedActions,
  createDraft,
  draftKey,
  knowledgeFilters,
  knowledgeSources,
  parseDraft,
  toolConnectors,
  toolFilters,
  toolSummary,
  type Integration,
  type LaunchDraft,
} from '@/lib/launch';
import { LaunchIcon, ProviderLogo } from './Assets';
import {
  Button,
  Callout,
  ContextPanel,
  FilterChip,
  FormField,
  IntegrationTile,
  SelectField,
} from './UI';
import { LaunchStepper } from './LaunchStepper';
import { IntegrationDialog } from './IntegrationDialog';
import { ModelRuntimeStep } from './ModelRuntimeStep';
import { GovernanceStep } from './GovernanceStep';
import { runtimeIsReady } from '@/lib/configuration';

export default function LaunchGuide({
  templateId = 'customer-service',
}: {
  templateId?: string;
}) {
  const template = getTemplate(templateId);
  const [draft, setDraft] = useState<LaunchDraft>(() =>
    createDraft(template.id),
  );
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('All');
  const [dialog, setDialog] = useState<Integration | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const filters = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(template.id));
      if (raw) {
        const saved = parseDraft(raw, template.id);
        if (saved) {
          setDraft(saved);
          setNotice('Saved draft restored.');
        } else
          setNotice(
            'The saved draft could not be restored. You can start a new draft.',
          );
      }
    } catch {
      setNotice(
        'Draft storage is unavailable. You can continue in this session.',
      );
    }
    setReady(true);
  }, [template.id]);
  const update = (changes: Partial<LaunchDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setNotice('');
  };
  const goTo = (step: number) => {
    update({ step });
    setFilter('All');
    setDialog(null);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const save = () => {
    try {
      const saved = { ...draft, savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey(template.id), JSON.stringify(saved));
      setDraft(saved);
      setNotice('Draft saved on this device.');
    } catch {
      setNotice(
        'Draft could not be saved. Check browser storage and try again. Your changes remain in this session.',
      );
    }
  };
  const next = () => {
    if (
      draft.step === 0 &&
      (!form.current?.reportValidity() ||
        !draft.name.trim() ||
        !draft.description.trim())
    )
      return;
    if (draft.step === 3 && !runtimeIsReady(draft.runtime)) return;
    if (draft.step < 5) goTo(draft.step + 1);
  };
  const isKnowledge = draft.step === 1;
  const integrations = isKnowledge ? knowledgeSources : toolConnectors;
  const selectedIds = isKnowledge ? draft.knowledge : Object.keys(draft.tools);
  const selected = selectedIds
    .map((id) => integrations.find((item) => item.id === id))
    .filter((item): item is Integration => Boolean(item));
  const titles = [
    "Let's start with the fundamentals.",
    'Connect knowledge sources',
    'Add tools and actions',
    'Choose model and runtime',
    'Define governance settings',
    'Evaluate your agent',
  ];
  const subtitles = [
    'Define what your agent will do and who will use it.',
    'Add the data your agent will use to find accurate answers.',
    'Connect the systems your agent can use and define what it can do.',
    'Use your organization default or choose another approved execution model.',
    'Keep your agent secure, compliant and aligned with company policies.',
    'Save your configuration to continue with evaluation.',
  ];
  const attach = (actions: string[]) => {
    if (!dialog) return;
    if (isKnowledge)
      update({ knowledge: [...new Set([...draft.knowledge, dialog.id])] });
    else
      update({
        tools: {
          ...draft.tools,
          [dialog.id]: approvedActions(dialog.id, actions),
        },
      });
    setDialog(null);
  };
  const remove = () => {
    if (!dialog) return;
    if (isKnowledge)
      update({ knowledge: draft.knowledge.filter((id) => id !== dialog.id) });
    else {
      const tools = { ...draft.tools };
      delete tools[dialog.id];
      update({ tools });
    }
    setDialog(null);
  };
  const addMore = () => {
    setFilter('All');
    filters.current?.querySelector<HTMLButtonElement>('button')?.focus();
    filters.current?.scrollIntoView({ block: 'nearest' });
  };
  return (
    <div className={`launchGuide step-${draft.step}`} aria-busy={!ready}>
      {draft.step === 0 && (
        <header className="launchHeader">
          <div className="launchIdentity">
            <LaunchIcon />
            <div>
              <h1>Launch {template.name}</h1>
              <p>Follow the steps to configure, test and deploy your agent.</p>
            </div>
          </div>
          <div className="launchHeaderActions">
            <Button variant="secondary" onClick={save} disabled={!ready}>
              Save draft
            </Button>
            <Button onClick={next} disabled={!ready}>
              Next →
            </Button>
          </div>
        </header>
      )}
      <LaunchStepper current={draft.step} onStep={goTo} />
      <div className="stepHeading">
        <h2 ref={heading} tabIndex={-1}>
          {titles[draft.step]}
        </h2>
        <p>{subtitles[draft.step]}</p>
      </div>
      {draft.step === 0 && (
        <div className="launchColumns useCaseColumns">
          <form
            id="use-case-form"
            ref={form}
            className="useCaseForm"
            onSubmit={(event) => {
              event.preventDefault();
              next();
            }}
          >
            <FormField
              id="agent-name"
              label="Agent name"
              value={draft.name}
              maxLength={120}
              required
              pattern=".*\S.*"
              onChange={(event) => update({ name: event.target.value })}
            />
            <div className="field">
              <label htmlFor="agent-description">Description</label>
              <textarea
                id="agent-description"
                required
                maxLength={2000}
                value={draft.description}
                onChange={(event) =>
                  update({ description: event.target.value })
                }
                onBlur={(event) =>
                  event.target.setCustomValidity(
                    event.target.value.trim()
                      ? ''
                      : 'Describe what your agent will do.',
                  )
                }
                onInput={(event) => event.currentTarget.setCustomValidity('')}
              />
            </div>
            <SelectField
              id="target-users"
              label="Target users"
              value={draft.targetUsers}
              onChange={(event) => update({ targetUsers: event.target.value })}
            >
              {[
                'Customers (external)',
                'Employees (internal)',
                'Partners',
                'Mixed audience',
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </SelectField>
            <SelectField
              id="industry"
              label="Industry (optional)"
              value={draft.industry}
              onChange={(event) => update({ industry: event.target.value })}
            >
              {[
                '',
                'Technology',
                'Financial Services',
                'Healthcare',
                'Retail',
                'Manufacturing',
                'Public Sector',
                'Other',
              ].map((value) => (
                <option key={value} value={value}>
                  {value || 'Select industry'}
                </option>
              ))}
            </SelectField>
          </form>
          <aside className="contextStack">
            <ContextPanel title="Expected outcomes">
              {template.outcomes.length ? (
                <ul className="outcomes">
                  {template.outcomes.map((outcome) => (
                    <li key={outcome}>
                      <span aria-hidden="true">✓</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Define what your agent will do and who will use it.</p>
              )}
            </ContextPanel>
            <Callout tone="info">
              A well-defined use case leads to better results.
            </Callout>
          </aside>
        </div>
      )}
      {(draft.step === 1 || draft.step === 2) && (
        <>
          <div
            ref={filters}
            className="filterRow integrationFilters"
            aria-label={
              isKnowledge ? 'Knowledge categories' : 'Tool categories'
            }
          >
            {(isKnowledge ? knowledgeFilters : toolFilters).map((category) => (
              <FilterChip
                key={category}
                active={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
              </FilterChip>
            ))}
          </div>
          <div className="launchColumns integrationColumns">
            <section
              className={`integrationGrid ${isKnowledge ? 'knowledgeGrid' : 'toolsGrid'}`}
              aria-label={isKnowledge ? 'Knowledge sources' : 'Tools & MCP'}
            >
              {integrations
                .filter(
                  (item) =>
                    filter === 'All' || item.categories.includes(filter),
                )
                .map((item) => (
                  <IntegrationTile
                    key={item.id}
                    provider={item.id}
                    name={item.name}
                    caption={item.caption}
                    onConnect={() => setDialog(item)}
                  />
                ))}
            </section>
            <aside className="contextStack">
              <ContextPanel
                className={isKnowledge ? 'sourcesPanel' : 'toolsPanel'}
                title={`${isKnowledge ? 'Connected sources' : 'Selected tools'} (${selected.length})`}
              >
                <div className="connectedResources">
                  {selected.map((item) => (
                    <button
                      type="button"
                      className="connectedResource"
                      key={item.id}
                      onClick={() => setDialog(item)}
                      aria-label={`Manage ${item.name}`}
                    >
                      <ProviderLogo provider={item.id} size={24} />
                      <span>
                        <strong>{item.name}</strong>
                        <small>
                          {isKnowledge
                            ? item.detail
                            : toolSummary(item, draft.tools[item.id] ?? [])}
                        </small>
                      </span>
                      <span className="statusDot" aria-label="Selected" />
                    </button>
                  ))}
                </div>
                {!selected.length && (
                  <p>
                    No {isKnowledge ? 'sources' : 'tools'} selected. Choose an
                    approved {isKnowledge ? 'source' : 'tool'} to connect.
                  </p>
                )}
                <Button variant="add" onClick={addMore}>
                  + {isKnowledge ? 'Add more sources' : 'Add tools'}
                </Button>
              </ContextPanel>
              <Callout>
                {isKnowledge
                  ? 'Your data stays in its approved environment and existing permissions are respected.'
                  : 'Control what your agent can do. Permissions and approvals stay explicit.'}
              </Callout>
            </aside>
          </div>
        </>
      )}
      {draft.step === 3 && (
        <ModelRuntimeStep
          value={draft.runtime}
          onChange={(runtime) => update({ runtime })}
        />
      )}
      {draft.step === 4 && (
        <GovernanceStep
          value={draft.governance}
          draft={draft}
          onChange={(governance) => update({ governance })}
        />
      )}
      {draft.step === 5 && (
        <section className="continuationPanel">
          <ContextPanel title="Continue with evaluation">
            <p>
              Evaluation is not available in this preview. Save your draft to
              continue later.
            </p>
            <p>
              Your use case, knowledge, tools, model and governance settings are
              preserved when you save. No evaluation has run and production
              deployment remains unavailable.
            </p>
          </ContextPanel>
        </section>
      )}
      <footer className="wizardActions">
        {draft.step === 0 ? (
          <Link href="/agents" className="button secondary">
            ← Back
          </Link>
        ) : (
          <Button variant="secondary" onClick={() => goTo(draft.step - 1)}>
            ← Back
          </Button>
        )}
        <div>
          {draft.step > 0 && draft.step < 5 && (
            <Button variant="secondary" onClick={save} disabled={!ready}>
              Save draft
            </Button>
          )}
          {draft.step < 5 ? (
            <Button
              onClick={next}
              disabled={
                !ready || (draft.step === 3 && !runtimeIsReady(draft.runtime))
              }
            >
              Next →
            </Button>
          ) : (
            <Button onClick={save} disabled={!ready}>
              Save draft
            </Button>
          )}
        </div>
      </footer>
      <p role="status" className="draftNotice">
        {notice}
      </p>
      {dialog && (
        <IntegrationDialog
          key={dialog.id}
          integration={dialog}
          selected={selectedIds.includes(dialog.id)}
          selectedActions={isKnowledge ? [] : (draft.tools[dialog.id] ?? [])}
          onClose={() => setDialog(null)}
          onSave={attach}
          onRemove={remove}
        />
      )}
    </div>
  );
}
