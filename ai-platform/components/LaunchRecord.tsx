'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  type LaunchDraft,
  knowledgeSources,
  toolConnectors,
} from '@/lib/launch';
import { approvedEndpoints, executionModels } from '@/lib/configuration';
import type { PreviewDeployment, ReferenceEvaluation } from '@/lib/preview';
import { Button } from './UI';
import { Tabs, Panel } from './journeys/Shared';
import { PageTitle, Table, Status } from './hybrid/UI';

export default function LaunchRecord({
  draft,
  receipt,
  evaluation,
  view,
  onBack,
  onIterate,
}: {
  draft: LaunchDraft;
  receipt: PreviewDeployment;
  evaluation: ReferenceEvaluation;
  view: 'agent' | 'deployment';
  onBack: () => void;
  onIterate: () => void;
}) {
  const [tab, setTab] = useState('Overview');
  const names = [
    'Overview',
    'Configuration',
    'Knowledge',
    'Tools',
    'Evaluations',
    'Versions',
    'Activity',
    'AgentOps',
  ];
  const infrastructure = executionModels.find(
    (x) => x.id === draft.infrastructure.kind,
  )?.name;
  const model = approvedEndpoints.find(
    (x) => x.id === draft.model.modelId,
  )?.name;
  const summary = [
    ['Mission', draft.description],
    ['Owner', draft.businessOwner],
    ['Success metric', draft.successMetric],
    ['Infrastructure', infrastructure],
    ['Model', model],
    ['Knowledge', `${draft.knowledge.length} sources`],
    ['Tools', `${Object.values(draft.tools).flat().length} actions`],
    [
      'Governance',
      `${Object.values(draft.governance.controls).filter(Boolean).length} protections`,
    ],
    ['Evaluation', `${evaluation.score}% · reference suite`],
    ['Environment', receipt.environment],
    [
      'Approval',
      draft.productionApproved
        ? 'Reviewed for preview'
        : 'Non-production preview',
    ],
  ];
  const facts = (
    <dl className="surfaceFacts">
      {summary.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v || 'Not specified'}</dd>
        </div>
      ))}
    </dl>
  );
  return (
    <div className="surfacePage hybridPage">
      <PageTitle
        title={
          view === 'deployment'
            ? `${draft.name} — Deployment preview`
            : draft.name
        }
        description={`Version v1.0 · ${receipt.environment} · Simulated deployment`}
      >
        <Button onClick={onIterate}>Create New Version</Button>
      </PageTitle>
      {view === 'deployment' ? (
        <div className="hybridSplit">
          <section className="panel">
            <h2>Deployment manifest</h2>
            {facts}
          </section>
          <section className="panel">
            <h2>Preview timeline</h2>
            <ol className="hybridTimeline">
              {[
                'Configuration reviewed',
                'Reference evaluation completed',
                'Environment selected',
                'Preview receipt issued',
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p>
              No runtime was provisioned. This receipt records the configuration
              reviewed in this journey.
            </p>
          </section>
        </div>
      ) : (
        <>
          <Tabs names={names} current={tab} onChange={setTab} />
          <Panel names={names} current={tab}>
            <section className="panel">
              {tab === 'Overview' || tab === 'Configuration' ? (
                <>
                  <h2>
                    {tab === 'Overview'
                      ? 'Agent overview'
                      : 'Version configuration'}
                  </h2>
                  {facts}
                  <p>
                    This version is read-only. Create a new version to make
                    changes.
                  </p>
                </>
              ) : tab === 'Knowledge' ? (
                <>
                  <h2>Connected knowledge</h2>
                  <Table
                    caption="Version knowledge"
                    headers={['Source', 'Permission']}
                    emptyMessage="No knowledge sources required for this version."
                    rows={draft.knowledge.map((id) => [
                      knowledgeSources.find((s) => s.id === id)?.name ?? id,
                      'Source ACLs enforced',
                    ])}
                  />
                </>
              ) : tab === 'Tools' ? (
                <>
                  <h2>Approved actions</h2>
                  <Table
                    caption="Version tools"
                    headers={['System', 'Action', 'Permission', 'Approval']}
                    emptyMessage="No tool actions required for this version."
                    rows={Object.entries(draft.tools).flatMap(([id, actions]) =>
                      actions.map((action) => {
                        const integration = toolConnectors.find(
                          (t) => t.id === id,
                        );
                        const item = integration?.actions?.find(
                          (a) => a.id === action,
                        );
                        return [
                          integration?.name ?? id,
                          item?.name ?? action,
                          item?.access ?? 'Scoped',
                          item?.requiresApproval
                            ? 'Human approval required'
                            : 'Policy enforced',
                        ];
                      }),
                    )}
                  />
                </>
              ) : tab === 'Evaluations' ? (
                <>
                  <h2>Reference evaluation</h2>
                  <p>
                    {evaluation.score}% readiness · reference fixture, not a
                    live model evaluation.
                  </p>
                  <Table
                    caption="Version evaluation"
                    headers={['Outcome', 'Scenarios']}
                    rows={evaluation.cases.map((c) => [c.status, c.count])}
                  />
                </>
              ) : tab === 'Versions' ? (
                <>
                  <h2>Agent Versions</h2>
                  <Table
                    caption="Created version"
                    headers={['Version', 'Environment', 'State', 'Evaluation']}
                    rows={[
                      [
                        'v1.0',
                        receipt.environment,
                        <Status key="state">Preview</Status>,
                        `${evaluation.score}%`,
                      ],
                    ]}
                  />
                  <p>Changes require a new version and a new evaluation.</p>
                </>
              ) : tab === 'Activity' ? (
                <>
                  <h2>Version activity</h2>
                  <ol className="hybridTimeline">
                    <li>Mission and configuration reviewed</li>
                    <li>Reference evaluation completed</li>
                    <li>
                      {receipt.environment} preview receipt issued for v1.0
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <h2>Operational signals</h2>
                  <p className="hybridEmpty">
                    No live tasks or incidents. This agent has only a deployment
                    preview.
                  </p>
                  <Link className="button secondary" href="/agentops">
                    Open AgentOps
                  </Link>
                </>
              )}
            </section>
          </Panel>
        </>
      )}
      <Button variant="secondary" onClick={onBack}>
        ← Back to confirmation
      </Button>
    </div>
  );
}
