'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getTemplate } from '@/lib/catalog';
import {
  createDraft,
  launchSteps,
  draftKey,
  parseDraft,
  type LaunchDraft,
} from '@/lib/launch';
import { Button, ContextPanel, FormField, SelectField } from './UI';
import { LaunchStepper } from './LaunchStepper';
import { ProviderModelStep } from './ProviderModelStep';
import { HybridResourcesStep } from './HybridResourcesStep';
import { AgentAssembly } from './AgentAssembly';
import { ModelRuntimeStep } from './ModelRuntimeStep';
import { GovernanceStep } from './GovernanceStep';
import { runtimeIsReady } from '@/lib/configuration';
import { EvaluateStep } from './EvaluateStep';
import { DeployStep } from './DeployStep';
import { LaunchSuccess } from './LaunchSuccess';
import ServerDrafts from './ServerDrafts';
import {
  previewRequest,
  type ReferenceEvaluation,
  type PreviewDeployment,
} from '@/lib/preview';

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
  const [evaluation, setEvaluation] = useState<ReferenceEvaluation | null>(
    null,
  );
  const [deployment, setDeployment] = useState<PreviewDeployment | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [overview, setOverview] = useState(false);
  const [notice, setNotice] = useState('');
  const form = useRef<HTMLFormElement>(null);
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
    if (
      Object.keys(changes).some((key) => !['step', 'environment'].includes(key))
    )
      setEvaluation(null);
    setDraft((current) => ({ ...current, ...changes }));
    setNotice('');
  };
  const goTo = (step: number) => {
    if (deploying || (step === 7 && !evaluation)) return;
    update({ step });
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
    if (draft.step === 4 && !runtimeIsReady(draft.runtime)) return;
    if (draft.step === 6 && !evaluation) return;
    if (draft.step < 7) goTo(draft.step + 1);
  };
  const titles = [
    'Launch a New Agent',
    'Connect knowledge sources',
    'Add tools and actions',
    'Choose where the agent runs',
    'Select the intelligence layer',
    'Governance & controls',
    'Production evaluation',
    'Deploy to production',
  ];
  const subtitles = [
    'Turn a business outcome into a production-ready AI mission.',
    'Add the data your agent will use to find accurate answers.',
    'Connect the systems your agent can use and define what it can do.',
    'Choose where your agent will run.',
    'Compare providers and select a model for your infrastructure.',
    'Keep your agent secure, compliant and aligned with company policies.',
    'Run sample queries and review production confidence before promotion.',
    'Review your configuration and choose the environment.',
  ];
  const deploy = async () => {
    if (!evaluation || !draft.environment || deploying) return;
    setDeploying(true);
    setNotice('');
    try {
      const result = await previewRequest<PreviewDeployment>({
        action: 'deploy',
        draft,
        token: evaluation.token,
        environment: draft.environment,
      });
      if (
        result.deployed !== false ||
        result.agentName !== draft.name ||
        result.environment !== draft.environment
      )
        throw new Error('Unexpected preview confirmation. Please try again.');
      setDeployment(result);
      window.scrollTo(0, 0);
    } catch (error) {
      setEvaluation(null);
      setDraft((current) => ({ ...current, step: 6 }));
      setNotice(
        error instanceof Error
          ? error.message
          : 'Preview failed. Please try again.',
      );
    } finally {
      setDeploying(false);
    }
  };
  const previewBanner = (
    <p className="previewBanner">
      Demo preview · Reference results and simulated deployment only. No live
      agent is created.
    </p>
  );
  if (deployment)
    return (
      <div className="launchGuide" aria-busy={false}>
        {previewBanner}
        {overview ? (
          <section className="previewOverview">
            <h1>{draft.name}</h1>
            <ContextPanel title="Agent Overview">
              <p>
                Your configuration is ready for review. Live performance and
                user feedback are not available in this preview.
              </p>
              <p>{draft.description}</p>
              <p>Preview environment: {deployment.environment}</p>
            </ContextPanel>
            <Button variant="secondary" onClick={() => setOverview(false)}>
              ← Back to confirmation
            </Button>
          </section>
        ) : (
          <LaunchSuccess
            receipt={deployment}
            onOverview={() => setOverview(true)}
            onIterate={() => {
              setDeployment(null);
              setEvaluation(null);
              goTo(0);
            }}
          />
        )}
      </div>
    );
  return (
    <div
      className={`launchGuide hybridJourney step-${draft.step}`}
      aria-busy={!ready}
    >
      <ServerDrafts
        draft={draft}
        onLoad={(saved) => {
          setDraft(saved);
          setEvaluation(null);
          setNotice('Server draft restored.');
        }}
      />
      <LaunchStepper current={draft.step} onStep={goTo} />
      <div className="hybridWorkarea">
        <div className="hybridStage">
          <p className="stageEyebrow">
            {draft.step === 0
              ? '01 / LAUNCH MISSION'
              : `STAGE ${draft.step + 1} / ${launchSteps[draft.step].toUpperCase()}`}
          </p>
          <div
            className={`stepHeading ${draft.step === 0 ? 'missionHeading' : ''}`}
          >
            {draft.step === 0 && (
              <span className="missionArrow" aria-hidden="true">
                ↗
              </span>
            )}
            <h2 ref={heading} tabIndex={-1}>
              {titles[draft.step]}
            </h2>
            <p>{subtitles[draft.step]}</p>
          </div>
          {draft.step === 0 && (
            <>
              <section className="missionControl">
                <strong>MISSION CONTROL</strong>
                <h3>What should this agent accomplish for the business?</h3>
                <p>
                  NEWNEO will translate the mission into knowledge, tools,
                  infrastructure, model, governance and production readiness.
                </p>
              </section>
              <form
                id="use-case-form"
                ref={form}
                className="missionForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
              >
                <div className="missionRow">
                  <FormField
                    id="agent-name"
                    label="Agent name"
                    value={draft.name}
                    required
                    maxLength={120}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                  <FormField
                    id="business-owner"
                    label="Business owner"
                    placeholder="e.g. VP Customer Experience"
                    value={draft.businessOwner ?? ''}
                    maxLength={200}
                    onChange={(e) => update({ businessOwner: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="agent-description">
                    Business purpose / mission
                  </label>
                  <textarea
                    id="agent-description"
                    required
                    maxLength={2000}
                    value={draft.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Describe the outcome, who it serves, and what success looks like…"
                  />
                </div>
                <div>
                  <label>Suggested missions</label>
                  <div className="missionSuggestions">
                    {[
                      'Resolve tier-1 support autonomously',
                      'Automate IT request routing',
                      'Qualify sales opportunities',
                      'Synthesize executive research',
                    ].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => update({ description: m })}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="missionRow three">
                  <FormField
                    id="target-users"
                    label="Target users"
                    value={draft.targetUsers}
                    onChange={(e) => update({ targetUsers: e.target.value })}
                  />
                  <FormField
                    id="success-metric"
                    label="Success metric"
                    placeholder="e.g. 70% autonomous"
                    value={draft.successMetric ?? ''}
                    onChange={(e) => update({ successMetric: e.target.value })}
                  />
                  <SelectField
                    id="criticality"
                    label="Business criticality"
                    value={draft.criticality ?? 'Standard'}
                    onChange={(e) => update({ criticality: e.target.value })}
                  >
                    <option>Standard</option>
                    <option>Critical</option>
                  </SelectField>
                </div>
                <div className="intelligenceNote">
                  <strong>✦ NEWNEO Intelligence</strong>Expected complexity:
                  Medium · likely needs CRM/ITSM data · Cloud or Hybrid
                  infrastructure · GPT-4o recommended.
                </div>
              </form>
            </>
          )}
          {(draft.step === 1 || draft.step === 2) && (
            <HybridResourcesStep draft={draft} onChange={update} />
          )}
          {draft.step === 3 && (
            <ModelRuntimeStep
              value={draft.runtime}
              onChange={(runtime) => update({ runtime })}
            />
          )}
          {draft.step === 4 && (
            <ProviderModelStep
              value={draft.runtime}
              onChange={(runtime) => update({ runtime })}
            />
          )}
          {draft.step === 5 && (
            <GovernanceStep
              value={draft.governance}
              draft={draft}
              onChange={(governance) => update({ governance })}
            />
          )}
          {draft.step === 6 && (
            <EvaluateStep
              draft={draft}
              result={evaluation}
              onResult={setEvaluation}
            />
          )}
          {draft.step === 7 && evaluation && (
            <DeployStep
              draft={draft}
              evaluation={evaluation}
              disabled={deploying}
              onEnvironment={(environment) => update({ environment })}
            />
          )}
          {draft.step >= 6 && previewBanner}
          <footer className="wizardActions">
            {draft.step === 0 ? (
              <Link href="/agents/catalog" className="button secondary">
                ← Back
              </Link>
            ) : (
              <Button
                variant="secondary"
                disabled={deploying}
                onClick={() => goTo(draft.step - 1)}
              >
                ← Back
              </Button>
            )}
            <div>
              {draft.step >= 0 && (
                <Button
                  variant="secondary"
                  onClick={save}
                  disabled={!ready || deploying}
                >
                  Save draft
                </Button>
              )}
              {draft.step < 7 ? (
                <Button
                  onClick={next}
                  disabled={
                    !ready ||
                    (draft.step === 4 && !runtimeIsReady(draft.runtime)) ||
                    (draft.step === 6 && !evaluation)
                  }
                >
                  {draft.step === 0
                    ? 'Continue to Knowledge →'
                    : draft.step === 3
                      ? 'Select Model →'
                      : draft.step === 4
                        ? 'Configure Governance →'
                        : 'Next →'}
                </Button>
              ) : (
                <Button
                  onClick={deploy}
                  disabled={!draft.environment || !evaluation || deploying}
                >
                  {deploying
                    ? 'Previewing deployment…'
                    : `Deploy to ${draft.environment ?? 'environment'}`}
                </Button>
              )}
            </div>
          </footer>
          <p role="status" className="draftNotice">
            {notice}
          </p>
        </div>
        <AgentAssembly draft={draft} />
      </div>
    </div>
  );
}
