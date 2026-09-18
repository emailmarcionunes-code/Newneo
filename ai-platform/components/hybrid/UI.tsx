'use client';
import {
  Bot,
  BookOpen,
  Wrench,
  FlaskConical,
  Rocket,
  Server, Activity, CircleCheck, Clock3, Coins, ShieldCheck, UsersRound,
  Layers3, Puzzle, TriangleAlert, Search, ChartNoAxesCombined,
} from 'lucide-react';
import Link from 'next/link';
import { useState, isValidElement, type ReactNode } from 'react';
import { AgentIcon } from '../Assets';
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
function metricIdentity(label: string) {
  if (/pending|incident|error|fail|violation|review|warning/i.test(label)) return { Icon: TriangleAlert, tone: 'amber' };
  if (/success|passed|compliance|readiness|matches|healthy/i.test(label)) return { Icon: CircleCheck, tone: 'green' };
  if (/cost|spend|budget|forecast/i.test(label)) return { Icon: Coins, tone: 'blue' };
  if (/latency|time|duration/i.test(label)) return { Icon: Clock3, tone: 'blue' };
  if (/user|member/i.test(label)) return { Icon: UsersRound, tone: 'blue' };
  if (/skill|capabilit/i.test(label)) return { Icon: Puzzle, tone: 'violet' };
  if (/knowledge|source|document/i.test(label)) return { Icon: BookOpen, tone: 'blue' };
  if (/polic|governance|control/i.test(label)) return { Icon: ShieldCheck, tone: 'blue' };
  if (/version|archiv/i.test(label)) return { Icon: Layers3, tone: 'blue' };
  if (/search/i.test(label)) return { Icon: Search, tone: 'blue' };
  if (/agent/i.test(label)) return { Icon: Bot, tone: 'blue' };
  return { Icon: /task|execution/i.test(label) ? Activity : ChartNoAxesCombined, tone: 'blue' };
}
export function Metrics({ items }: { items: [string, string, string?][] }) {
  return <div className={`hybridMetrics count-${items.length}`}>
    {items.map(([label, value, note]) => {
      const { Icon, tone } = metricIdentity(label);
      const unavailable = /^(—|–|Unavailable|Not enabled)$/i.test(value);
      return <article key={label} data-metric={label} data-value={value} data-tone={unavailable ? 'muted' : tone}>
        <span className="metricLabel">{label}</span>
        <i className="metricIcon" aria-hidden="true"><Icon size={18} strokeWidth={1.5}/></i>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
        {/readiness|compliance score/i.test(label) && value.endsWith('%') && <Progress value={parseFloat(value)} label={label} tone={/compliance/i.test(label) ? 'green' : 'blue'} compact />}
      </article>;
    })}
  </div>;
}
function cellText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(cellText).join(' ');
  if (isValidElement<{ children?: ReactNode }>(value)) return cellText(value.props.children);
  return '';
}
export function Table({ headers, rows, caption, emptyMessage, onRowClick, toolbar }: {
  headers: string[]; rows: ReactNode[][]; caption: string; emptyMessage?: string;
  onRowClick?: (index: number) => void; toolbar?: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{column: number; ascending: boolean} | null>(null);
  const visible = rows.map((cells, index) => ({cells, index})).filter(({cells}) =>
    cells.map(cellText).join(' ').toLowerCase().includes(query.toLowerCase()));
  if (sort) visible.sort((a, b) => cellText(a.cells[sort.column]).localeCompare(cellText(b.cells[sort.column]), undefined, {numeric: true}) * (sort.ascending ? 1 : -1));
  const searchable = !!onRowClick || rows.length > 5;
  return <section className="listFrame" aria-label={caption}>
    {(toolbar || searchable) && <div className="listToolbar">{toolbar || <label className="listSearch"><Search size={18} aria-hidden="true"/><input aria-label={`Search ${caption}`} placeholder={`Search ${caption.toLowerCase()}…`} value={query} onChange={e => setQuery(e.target.value)}/></label>}</div>}
    <div className="hybridTable" role="region" aria-label={`${caption} rows`} tabIndex={0}>
      <table><caption className="srOnly">{caption}</caption><thead><tr>
        {headers.map((h, column) => <th key={column} scope="col" aria-sort={sort?.column === column ? sort.ascending ? 'ascending' : 'descending' : 'none'}><button className="listSort" onClick={() => setSort({column, ascending: sort?.column === column ? !sort.ascending : true})}>{h}{sort?.column === column && <span aria-hidden="true">{sort.ascending ? ' ↑' : ' ↓'}</span>}</button></th>)}
        {onRowClick && <th scope="col"><span className="srOnly">Open</span></th>}
      </tr></thead><tbody>{visible.map(({cells, index}) => <tr key={index} className={onRowClick ? 'navigableRow' : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={event => {if (onRowClick && event.target === event.currentTarget && event.key === 'Enter') {event.preventDefault(); onRowClick(index);}}}
        onClick={event => {if (onRowClick && !(event.target as HTMLElement).closest('a, button, input, select, textarea') && !window.getSelection()?.toString()) onRowClick(index);}}>
        {cells.map((v, j) => <td key={j}>{v}</td>)}
        {onRowClick && <td className="listOpenCell"><button className="listOpen" aria-label={`Open ${cellText(cells[0])}`} onClick={() => onRowClick(index)}>Open ↗</button></td>}
      </tr>)}</tbody></table>
      {!visible.length && <p className="hybridEmpty">{emptyMessage ?? 'No matching records. Clear your filters to see all results.'}</p>}
    </div>
    <footer className="listFooter"><span>{visible.length} of {rows.length} records</span>{onRowClick && <span>Select a row · Enter or Open for details</span>}</footer>
  </section>;
}
export function IconLabel({
  children,
  kind = 'agent',
  identity,
}: {
  children: ReactNode;
  identity?: string;
  kind?: 'skill' | 'agent' | 'source' | 'tool' | 'evaluation' | 'deployment' | 'server';
}) {
  const Icon = {
    skill: Puzzle,
    agent: Bot,
    source: BookOpen,
    tool: Wrench,
    evaluation: FlaskConical,
    deployment: Rocket,
    server: Server,
  }[kind];
  return (
    <span className={`referenceIconLabel ${kind}`}>
      {kind === 'agent' ? <AgentIcon identity={identity} name={typeof children === 'string' ? children : undefined}/> : <span className="referenceIcon"><Icon size={17} strokeWidth={1.5} aria-hidden="true" /></span>}
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
  const tone = /not |unavailable|disconnected|not enabled|not activated|paused|archived|revoked|inactive|optional|demo/i.test(children)
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
  // Demo mode is identified once in the global header.
  return null;
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
