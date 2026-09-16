'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePreview, identifier } from './journeys/PreviewState';
import { approvedEndpoints } from '@/lib/configuration';
import { agentConfiguration } from '@/lib/preview-records';
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
import { productionBlockers, readiness } from '@/lib/readiness';
import { parseModel } from '@/lib/configuration';
import { EvaluateStep } from './EvaluateStep';
import { DeployStep } from './DeployStep';
import LaunchRecord from './LaunchRecord';
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
  const { update: updateWorkspace } = usePreview();
  const [workspaceAgentId, setWorkspaceAgentId] = useState('');
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
  const [overview, setOverview] = useState<'agent' | 'deployment' | null>(null);
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
      Object.keys(changes).some(
        (key) =>
          ![
            'step',
            'environment',
            'productionApproved',
            'reviewedStages',
          ].includes(key),
      )
    )
      setEvaluation(null);
    setDraft((current) => ({
      ...current,
      ...changes,
      ...(!Object.keys(changes).every((k) =>
        [
          'step',
          'environment',
          'productionApproved',
          'reviewedStages',
        ].includes(k),
      )
        ? {
            productionApproved: false,
            reviewedStages: current.reviewedStages.filter(
              (s) => s !== current.step,
            ),
          }
        : {}),
    }));
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
    if (draft.step === 4 && !parseModel(draft.model)) return;
    if (draft.step === 6 && !evaluation) return;
    if (draft.step < 7) {
      setDraft((d) => ({
        ...d,
        step: d.step + 1,
        reviewedStages: [...new Set([...d.reviewedStages, d.step])],
      }));
      requestAnimationFrame(() => heading.current?.focus());
    }
  };
  const titles = [
    'Launch a New Agent',
    'Connect knowledge sources',
    'Define tools & actions',
    'Choose where the agent runs',
    'Select the intelligence layer',
    'Governance & controls',
    'Production evaluation',
    'Deploy to production',
  ];
  const subtitles = [
    'Turn a business outcome into a production-ready AI mission.',
    'Define what the agent knows. NEWNEO estimates whether the connected knowledge can support the business outcome.',
    'Define what the agent can do. Actions carry permission scope, business impact and approval requirements.',
    'Infrastructure is a deployment decision — separate from the model. Optimize sovereignty, latency, operations and cost.',
    'Select the foundation model independently from infrastructure. Compare context, reasoning, latency, governance fit and cost.',
    'Define how this agent is controlled. Active protections create confidence without adding unnecessary bureaucracy.',
    'Review confidence, warnings and failures from representative scenarios before deployment.',
    'Review the deployment manifest, select the environment and deliberately promote this agent into service.',
  ];
  const deploy = async () => {
    if (
      !evaluation ||
      !draft.environment ||
      deploying ||
      (draft.environment === 'Production' &&
        productionBlockers(draft, evaluation).length)
    )
      return;
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
      const agentId = `preview-${identifier()}`;
      const runId = identifier();
      const releaseId = identifier();
      const model =
        approvedEndpoints.find((e) => e.id === draft.model.modelId)?.name ||
        draft.model.modelId;
      updateWorkspace((s) => {
        const ui = {
          ...s.ui,
          [`agent:${agentId}:mission`]: draft.description,
          [`agent:${agentId}:owner`]: draft.businessOwner || 'Workspace owner',
          [`agent:${agentId}:model`]: model,
          [`agent:${agentId}:launch`]: draft,
          ['workspace:agents']: [
            ...(Array.isArray(s.ui?.['workspace:agents'])
              ? s.ui['workspace:agents']
              : []),
            {
              id: agentId,
              name: draft.name,
              model,
              status: draft.environment === 'Production' ? 'Live' : 'Staging',
              tasks: '0',
              success: '—',
              latency: '—',
              cost: 0,
              budget: 100,
              score: evaluation.score,
            },
          ],
        };
        return {
          ...s,
          ui,
          runs: [
            {
              id: runId,
              agentId,
              configuration: agentConfiguration(ui, agentId),
              suiteId: 'launch',
              category: 'Regression',
              question:
                'Validate the configured agent against the launch requirements.',
              expected: 'Approved configuration and readiness checks.',
              name: 'Launch readiness',
              version: 'v1.0',
              passed: true,
              score: evaluation.score,
            },
            ...s.runs,
          ],
          releases: [
            {
              id: releaseId,
              runId,
              agentId,
              version: 'v1.0',
              source: 'Development',
              target: draft.environment!,
              state: 'Active',
              reason: draft.productionApproved
                ? 'Manifest reviewed and approved in Launch Guide'
                : 'Non-production launch preview',
            },
            ...s.releases,
          ],
          audit: [
            `Created ${draft.name} v1.0 in ${draft.environment} · preview`,
            ...s.audit,
          ],
        };
      });
      setWorkspaceAgentId(agentId);
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
        <div className="resourceFooter">
          <Link className="button outline" href={`/agents/${workspaceAgentId}`}>
            Open saved agent
          </Link>
          <Link className="button outline" href="/deployments">
            Open release history
          </Link>
        </div>
        {overview ? (
          <LaunchRecord
            draft={draft}
            receipt={deployment}
            evaluation={evaluation!}
            view={overview}
            onBack={() => setOverview(null)}
            onIterate={() => {
              setOverview(null);
              setDeployment(null);
              setEvaluation(null);
              update({
                step: 0,
                productionApproved: false,
                reviewedStages: [],
              });
            }}
          />
        ) : (
          <LaunchSuccess
            receipt={deployment}
            onOverview={() => setOverview('agent')}
            onDeployment={() => setOverview('deployment')}
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
      <LaunchStepper
        current={draft.step}
        onStep={goTo}
        completed={readiness(draft, evaluation).stages.map((s) => s.complete)}
      />
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
              value={draft.infrastructure}
              onChange={(infrastructure) => update({ infrastructure })}
            />
          )}
          {draft.step === 4 && (
            <ProviderModelStep
              value={draft.model}
              onChange={(model) => update({ model })}
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
              onRemediate={() => {
                update({ evaluationRemediation: true });
              }}
            />
          )}
          {draft.step === 7 && evaluation && (
            <DeployStep
              draft={draft}
              evaluation={evaluation}
              disabled={deploying}
              onEnvironment={(environment) => update({ environment })}
              onApprove={(productionApproved) => update({ productionApproved })}
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
                    (draft.step === 4 && !parseModel(draft.model)) ||
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
                  disabled={
                    !draft.environment ||
                    !evaluation ||
                    deploying ||
                    (draft.environment === 'Production' &&
                      productionBlockers(draft, evaluation).length > 0)
                  }
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
        <AgentAssembly draft={draft} evaluation={evaluation} />
      </div>
    </div>
  );
}
