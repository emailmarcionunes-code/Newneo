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
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          {note && <small>{note}</small>}
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
}: {
  headers: string[];
  rows: ReactNode[][];
  caption: string;
  emptyMessage?: string;
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
            <tr key={i}>
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
export function Status({ children }: { children: string }) {
  return (
    <span
      className={`hybridStatus ${/Live|Success|Passed|Active|Approved|Resolved/.test(children) ? 'healthy' : /Error|Failed|Degraded|High|Rejected/.test(children) ? 'danger' : /Warning|Pending|Medium|Rollback/.test(children) ? 'warning' : 'neutral'}`}
    >
      {children}
    </span>
  );
}
export function Bars({ items }: { items: [string, number, string?][] }) {
  return (
    <div className="hybridBars">
      {items.map(([name, value, note]) => (
        <div key={name}>
          <div>
            <span>{name}</span>
            <strong>{note ?? `${value}%`}</strong>
          </div>
          <progress aria-label={name} max={100} value={value} />
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
    <p className="hybridDataNote">Reference workspace · interactive preview</p>
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
