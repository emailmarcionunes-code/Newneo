'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Skill } from '@/lib/skills';
import {
  capabilityCores,
  domainPatterns,
  reuseOf,
  coreUsage,
  portfolioSuggestions,
} from '@/lib/skill-portfolio';

type Telemetry = (id: string) => {
  users: { id: string }[];
  executions: number | null;
  success: number | null;
};
const stateClass = (s: Skill) =>
  ({
    Experimental: 'experimental',
    Validated: 'validated',
    'Production Ready': 'ready',
    'Proven at Scale': 'proven',
  })[s.maturity];
export function SkillPortfolio({
  skills,
  telemetry,
}: {
  skills: Skill[];
  telemetry: Telemetry;
}) {
  const [expanded, setExpanded] = useState(false);
  const [opportunity, setOpportunity] = useState('');
  const ranked = capabilityCores
    .map((c) => ({ ...c, ...coreUsage(skills, c.id) }))
    .sort(
      (a, b) =>
        b.domains.length - a.domains.length ||
        b.skills.length - a.skills.length,
    );
  const top = ranked[0];
  const domains = expanded
    ? domainPatterns
    : domainPatterns.filter((d) =>
        [
          'healthcare',
          'it-services',
          'financial-services',
          'hr',
          'legal',
          'customer-service',
        ].includes(d.id),
      );
  const cores = expanded
    ? capabilityCores
    : capabilityCores.filter((c) =>
        [
          'identity',
          'scheduling',
          'eligibility',
          'documents',
          'exception',
          'intake',
        ].includes(c.id),
      );
  const missing = ranked
    .filter((c) => c.domains.length >= 2)
    .slice(0, 3)
    .map((c) => ({
      core: c,
      domain: domainPatterns.find((d) => !c.domains.includes(d.id))!,
    }));
  return (
    <>
      <section
        className="intelligenceNote portfolioIntelligence"
        aria-labelledby="portfolio-intelligence"
      >
        <h2 id="portfolio-intelligence">Portfolio Intelligence</h2>
        <p>Build vertically. Reuse horizontally.</p>
        <div className="portfolioInsights">
          {top && (
            <div>
              <strong>Most Reused Core · {top.name}</strong>
              <p>
                {top.skills.length} Skills across {top.domains.length} domains.
              </p>
            </div>
          )}
          {ranked
            .filter((c) => c.domains.length >= 2 && c.id !== top?.id)
            .slice(0, 2)
            .map((c) => (
              <div key={c.id}>
                <strong>{c.name} Core</strong>
                <p>
                  Shared by {c.skills.length} Skills across {c.domains.length}{' '}
                  domains.
                </p>
              </div>
            ))}
        </div>
        <small>
          Based on current portfolio metadata, including demonstration
          definitions. Reuse is breadth of adoption, not a quality or readiness
          score.
        </small>
      </section>
      <section className="panel skillMatrix" aria-labelledby="matrix-title">
        <div className="portfolioHeading">
          <div>
            <h2 id="matrix-title">Skill Matrix</h2>
            <p>Discover how capabilities are adapted across domains.</p>
          </div>
          <button
            className="button secondary"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded
              ? 'Representative view'
              : 'Show all domains & capabilities'}
          </button>
        </div>
        <div className="matrixLegend" aria-label="Matrix maturity legend">
          {[
            'Experimental',
            'Validated',
            'Production Ready',
            'Proven at Scale',
          ].map((m) => (
            <span key={m}>
              <i
                className={`matrixDot ${stateClass({ maturity: m } as Skill)}`}
              />
              {m}
            </span>
          ))}
          <span>— Opportunity</span>
        </div>
        <div
          className="matrixScroll"
          tabIndex={0}
          role="region"
          aria-label="Skill Matrix — scroll to explore domains and capabilities"
        >
          <table>
            <caption className="sr-only">
              Domain by capability Skills matrix
            </caption>
            <thead>
              <tr>
                <th scope="col">Domain / capability</th>
                {cores.map((c) => (
                  <th scope="col" key={c.id}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.id}>
                  <th scope="row">{d.domain}</th>
                  {cores.map((c) => {
                    const members = skills.filter((s) => {
                      const r = reuseOf(s);
                      return r?.coreId === c.id && r.domainPatternId === d.id;
                    });
                    return (
                      <td key={c.id}>
                        {members.length ? (
                          members.map((s) => {
                            const t = telemetry(s.id);
                            const details = `${s.name} · ${s.maturity} · v${s.version} · ${t.users.length} Agents · ${t.executions === null ? 'No execution history' : `${t.executions.toLocaleString('en-US')} executions`} · ${t.success === null ? 'Success not measured' : `${t.success.toFixed(1)}% success`} · ${c.name} Core`;
                            return (
                              <Link
                                key={s.id}
                                className={`matrixSkill ${stateClass(s)}`}
                                href={`/skills/${s.id}`}
                                title={details}
                                aria-label={details}
                              >
                                <span>{s.name}</span>
                                <small>
                                  {s.maturity} · v{s.version}
                                </small>
                                <span className="matrixPreview">
                                  {t.users.length} Agents ·{' '}
                                  {t.executions?.toLocaleString('en-US') ?? '—'}{' '}
                                  executions · {t.success?.toFixed(1) ?? '—'}%
                                  success
                                  <br />
                                  {c.name} Core
                                </span>
                              </Link>
                            );
                          })
                        ) : (
                          <button
                            className="matrixEmpty"
                            aria-label={`Opportunity: ${c.name} × ${d.domain}`}
                            onClick={() =>
                              setOpportunity(
                                `No Skill exists yet for ${c.name} × ${d.domain}. Explore this adaptation with domain experts; no Skill has been created.`,
                              )
                            }
                          >
                            —<span>Opportunity</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p role="status">
          {opportunity ||
            'Select a Skill to inspect it. Empty combinations are opportunities, not automatically created capabilities.'}
        </p>
      </section>
      <section className="panel" aria-labelledby="opportunities-title">
        <h2 id="opportunities-title">Portfolio Opportunities</h2>
        <div className="portfolioInsights">
          {missing.map(({ core, domain }) => (
            <div key={core.id}>
              <strong>
                {core.name} × {domain.domain}
              </strong>
              <p>
                {core.name} Core is present in {core.domains.length} domains,
                but not yet in {domain.domain}. Review whether its existing
                logic can be adapted.
              </p>
            </div>
          ))}
        </div>
        <small>
          Strategic suggestions from portfolio gaps. Domain validation,
          governance review and evaluation are still required.
        </small>
      </section>
    </>
  );
}
export function SkillReuseDetail({
  skill,
  skills,
  telemetry,
}: {
  skill: Skill;
  skills: Skill[];
  telemetry: Telemetry;
}) {
  const reuse = reuseOf(skill),
    core = capabilityCores.find((c) => c.id === reuse?.coreId),
    pattern = domainPatterns.find((p) => p.id === reuse?.domainPatternId);
  if (!core || !reuse)
    return (
      <section className="reuseDetail">
        <h2>Built from</h2>
        <p>
          Skill-specific configuration. No reusable pattern has been selected
          yet.
        </p>
      </section>
    );
  const usage = coreUsage(skills, core.id);
  const agents = new Set(
    usage.skills.flatMap((s) => telemetry(s.id).users.map((u) => u.id)),
  ).size;
  return (
    <section className="reuseDetail">
      <h2>Built from</h2>
      <p>
        <strong>{core.name} Core</strong> + {pattern?.domain || skill.domain}{' '}
        Domain Pattern + Skill-specific configuration
      </p>
      <p>
        Reuse: {usage.skills.length} Skills · {usage.domains.length} domains ·{' '}
        {agents} Agents across this Core. This describes reuse breadth, not
        quality.
      </p>
      <h3>Reused components</h3>
      <ul>
        {reuse.components.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      {pattern && (
        <details>
          <summary>Domain adaptation requirements</summary>
          <p>{pattern.terminology.join(' · ')}</p>
          <ul>
            {[
              ...pattern.regulatoryConstraints,
              ...pattern.dataBoundaryRules,
              ...pattern.domainEvaluations,
            ].map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </details>
      )}
      <h3>Related Skills</h3>
      <p>These Skills share the same {core.name} Core.</p>
      <div className="relatedSkills">
        {usage.skills
          .filter((s) => s.id !== skill.id)
          .map((s) => (
            <Link key={s.id} href={`/skills/${s.id}`}>
              {s.name} →
            </Link>
          ))}
        {usage.skills.length < 2 && <p>No other Skills share this Core yet.</p>}
      </div>
    </section>
  );
}
export function SkillReuseGuidance({
  skill,
  skills,
  onReuse,
}: {
  skill: Skill;
  skills: Skill[];
  onReuse: (patch: Partial<Skill>) => void;
}) {
  const [query, setQuery] = useState('');
  const term = query || `${skill.name} ${skill.description}`;
  const cores = portfolioSuggestions(term).slice(0, 3);
  const words = term
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const similar = skills
    .filter(
      (s) =>
        s.id !== skill.id &&
        words.some((w) =>
          `${s.name} ${s.toolRequirements.join(' ')} ${s.governanceRequirements.join(' ')}`
            .toLowerCase()
            .includes(w),
        ),
    )
    .slice(0, 3);
  return (
    <section className="intelligenceNote reuseGuidance">
      <h3>Existing capabilities that may accelerate this Skill</h3>
      <p>
        Do not rebuild what already exists. Search Skills, Capability Cores,
        common tools and governance patterns before implementation.
      </p>
      <label>
        Search reusable patterns
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Scheduling, identity, approval, ServiceNow…"
        />
      </label>
      {!cores.length && !similar.length ? (
        <p>
          {term.trim()
            ? 'No matching patterns yet. You can continue with a Skill-specific definition.'
            : 'Enter a Skill name or search term to discover reuse opportunities.'}
        </p>
      ) : (
        <>
          <p>
            <strong>Platform guidance · demo estimate:</strong> Up to{' '}
            {cores.length ? '68%' : '35%'} of this Skill may be assembled from
            existing patterns. Illustrative estimate, not a measured match or
            guaranteed automation.
          </p>
          <div className="portfolioInsights">
            {cores.map((c) => (
              <div key={c.id}>
                <strong>{c.name} Core</strong>
                <p>{c.description}</p>
                <small>
                  Tools: {c.toolPatterns.join(', ')}
                  <br />
                  Governance: {c.governanceProfile.join(', ')}
                </small>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    const pattern = domainPatterns.find(
                      (p) =>
                        p.domain === skill.domain ||
                        (skill.domain === 'IT' && p.id === 'it-services') ||
                        (skill.domain === 'Finance' &&
                          p.id === 'financial-services') ||
                        (skill.domain === 'Support' &&
                          p.id === 'customer-service'),
                    );
                    onReuse({
                      reuse: {
                        coreId: c.id,
                        domainPatternId: pattern?.id || '',
                        components: [...c.reusableLogic],
                      },
                      toolRequirements: [
                        ...new Set([
                          ...skill.toolRequirements,
                          ...c.toolPatterns,
                        ]),
                      ],
                      governanceRequirements: [
                        ...new Set([
                          ...skill.governanceRequirements,
                          ...c.governanceProfile,
                        ]),
                      ],
                    });
                  }}
                  aria-pressed={skill.reuse?.coreId === c.id}
                >
                  {skill.reuse?.coreId === c.id
                    ? 'Pattern selected'
                    : `Reuse ${c.name} pattern`}
                </button>
              </div>
            ))}
          </div>
          {similar.length > 0 && (
            <>
              <h4>Similar Skills</h4>
              <div className="relatedSkills">
                {similar.map((s) => (
                  <Link
                    key={s.id}
                    href={`/skills/${s.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.name} · v{s.version} ↗
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {skill.reuse && (
        <p role="status">
          Reusable pattern selected. Tool and governance requirements are added
          for review; no executable logic, connections or approval are
          automatically granted.
        </p>
      )}
    </section>
  );
}
