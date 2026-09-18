'use client';
import { useState } from 'react';
import ResourceExperience from './ResourceExperience';
import { surfaces } from '@/lib/surfaces';
import { FilterChip, Button } from './UI';
export function DemoNotice() {
  return null;
}
export default function RegistrySurface({ surface }: { surface: string }) {
  if (surface === 'knowledge' || surface === 'tools')
    return <ResourceExperience key={surface} surface={surface} />;
  return <GenericRegistry surface={surface} />;
}
function GenericRegistry({ surface }: { surface: string }) {
  const config = surfaces[surface];
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const categories = config.categories ?? [
    ...new Set(config.records.map((record) => record.category)),
  ];
  const records = config.records.filter(
    (record) =>
      (category === 'All' || record.category === category) &&
      `${record.name} ${record.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const detail = config.records.find((record) => record.id === selected);
  return (
    <div className="surfacePage">
      <div className="pageHead">
        <div>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
      </div>
      <DemoNotice />
      <div className="surfaceSearch">
        <label htmlFor="registry-search">Search {config.title}</label>
        <input
          id="registry-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description"
        />
      </div>
      <div className="filterRow" aria-label="Categories">
        {['All', ...categories].map((name) => (
          <FilterChip
            key={name}
            active={category === name}
            onClick={() => setCategory(name)}
          >
            {name}
          </FilterChip>
        ))}
      </div>
      <p role="status" className="surfaceMuted">
        {records.length} {records.length === 1 ? 'result' : 'results'}
      </p>
      <div className="surfaceColumns">
        <div>
          {records.length === 0 ? (
            <section className="panel">
              <h2>No matching results</h2>
              <p>Try a different search or category.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setCategory('All');
                }}
              >
                Clear filters
              </Button>
            </section>
          ) : (
            <div className="surfaceCards">
              {records.map((record) => (
                <article className="agentCard" key={record.id}>
                  <span className="tag">{record.category}</span>
                  <h2>{record.name}</h2>
                  <p>{record.description}</p>
                  <strong className="surfaceStatus">{record.status}</strong>
                  <Button
                    variant="link"
                    aria-expanded={selected === record.id}
                    aria-controls="registry-details"
                    onClick={() => setSelected(record.id)}
                  >
                    View {record.name} details →
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside
          id="registry-details"
          className="panel surfaceAside"
          aria-label="Selected resource details"
        >
          {detail ? (
            <>
              <div className="surfaceHeading">
                <h2>{detail.name}</h2>
                <Button
                  variant="secondary"
                  onClick={() => setSelected(null)}
                  aria-label="Close resource details"
                >
                  ×
                </Button>
              </div>
              <dl className="surfaceFacts">
                {detail.fields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {detail.details?.map(([title, body]) => (
                <details key={title}>
                  <summary>{title}</summary>
                  <p>{body}</p>
                </details>
              ))}
            </>
          ) : (
            <>
              <h2>Resource details</h2>
              <p>
                Select a resource to review its status, permissions and
                readiness.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
