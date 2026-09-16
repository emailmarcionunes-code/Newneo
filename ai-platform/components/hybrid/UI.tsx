import {
  Bot,
  BookOpen,
  Wrench,
  FlaskConical,
  Rocket,
  Server,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="pageHead">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </header>
  );
}
export function Metrics({ items }: { items: [string, string, string?][] }) {
  return (
    <div className={`hybridMetrics count-${items.length}`}>
      {items.map(([label, value, note]) => (
        <article key={label} data-metric={label} data-value={value}>
          <span>{label}</span>
          <strong>{value}</strong>
          {note && <small>{note}</small>}
          {/readiness|compliance score/i.test(label) && value.endsWith('%') && (
            <Progress
              value={parseFloat(value)}
              label={label}
              tone={/compliance/i.test(label) ? 'green' : 'blue'}
              compact
            />
          )}
        </article>
      ))}
    </div>
  );
}
export function Table({
  headers,
  rows,
  caption,
  emptyMessage,
  onRowClick,
}: {
  headers: string[];
  rows: ReactNode[][];
  caption: string;
  emptyMessage?: string;
  onRowClick?: (index: number) => void;
}) {
  return (
    <div
      className="hybridTable"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table>
        <caption className="srOnly">{caption}</caption>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={onRowClick ? 'navigableRow' : undefined}
              onClick={
                onRowClick
                  ? (event) => {
                      if (
                        (event.target as HTMLElement).closest(
                          'a, button, input, select, textarea',
                        )
                      )
                        return;
                      if (window.getSelection()?.toString()) return;
                      onRowClick(i);
                    }
                  : undefined
              }
            >
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="hybridEmpty">
          {emptyMessage ??
            'No matching records. Clear your filters to see all results.'}
        </p>
      )}
    </div>
  );
}
export function IconLabel({
  children,
  kind = 'agent',
}: {
  children: ReactNode;
  kind?: 'agent' | 'source' | 'tool' | 'evaluation' | 'deployment' | 'server';
}) {
  const Icon = {
    agent: Bot,
    source: BookOpen,
    tool: Wrench,
    evaluation: FlaskConical,
    deployment: Rocket,
    server: Server,
  }[kind];
  return (
    <span className={`referenceIconLabel ${kind}`}>
      <span className="referenceIcon">
        <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
      </span>
      {children}
    </span>
  );
}
export function Tag({ children }: { children: ReactNode }) {
  return <span className="referenceTag">{children}</span>;
}
export function Progress({
  value,
  label,
  tone = 'blue',
  compact = false,
}: {
  value: number;
  label: string;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'cyan';
  compact?: boolean;
}) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return (
    <span className={`referenceProgress ${tone} ${compact ? 'compact' : ''}`}>
      <progress aria-label={label} value={Math.min(safe, 100)} max={100} />
      {!compact && <span>{Number(safe.toFixed(1))}%</span>}
    </span>
  );
}
export function Status({ children }: { children: string }) {
  const tone = /paused|archived|revoked|inactive|optional/i.test(children)
    ? 'muted'
    : /live|success|passed|active|approved|resolved|enforced|low|synced|online|complete/i.test(
          children,
        )
      ? 'healthy'
      : /error|failed|high|rejected/i.test(children)
        ? 'danger'
        : /warning|degraded|needs review|pending|medium|escalated|rollback|rolled back/i.test(
              children,
            )
          ? 'warning'
          : 'neutral';
  return <span className={`hybridStatus ${tone}`}>{children}</span>;
}
export function Bars({
  items,
  semantics = 'neutral',
}: {
  items: [string, number, string?][];
  semantics?: 'neutral' | 'budget' | 'quality';
}) {
  return (
    <div className="hybridBars">
      {items.map(([name, value, note]) => (
        <div
          key={name}
          data-tone={
            semantics === 'budget'
              ? value >= 100
                ? 'danger'
                : value >= 80
                  ? 'warning'
                  : 'healthy'
              : semantics === 'quality'
                ? value < 70
                  ? 'danger'
                  : value < 85
                    ? 'warning'
                    : 'healthy'
                : 'blue'
          }
        >
          <div>
            <span>{name}</span>
            <strong>{note ?? `${value}%`}</strong>
          </div>
          <Progress
            label={name}
            value={value}
            tone={
              semantics === 'quality'
                ? value < 80
                  ? 'red'
                  : value < 90
                    ? 'amber'
                    : 'green'
                : 'blue'
            }
          />
        </div>
      ))}
    </div>
  );
}
export function DetailLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="hybridDetailLink" href={href}>
      {children}
    </Link>
  );
}
export function DataNote() {
  return (
    <p className="hybridDataNote">
      Interactive demo · sample data · no live execution
    </p>
  );
}
export function exportCsv(name: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((v) => '"' + v.replaceAll('"', '""') + '"').join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
