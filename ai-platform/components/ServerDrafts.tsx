'use client';
import { useEffect, useState } from 'react';
import { Button } from './UI';
import { parseDraft, type LaunchDraft } from '@/lib/launch';
type Saved = {
  id: string;
  template_id: string;
  configuration: LaunchDraft;
  revision: number;
};
export default function ServerDrafts({
  draft,
  onLoad,
}: {
  draft: LaunchDraft;
  onLoad: (draft: LaunchDraft) => void;
}) {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [records, setRecords] = useState<Saved[]>([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editable, setEditable] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/session', { cache: 'no-store' });
        const session = await response.json();
        if (
          !active ||
          !response.ok ||
          !session.authenticated ||
          !session.workspaceId
        )
          return;
        setWorkspace(session.workspaceId);
        setEditable(
          Boolean(
            session.workspaces?.find(
              (w: { id: string; can_edit_agents: boolean }) =>
                w.id === session.workspaceId,
            )?.can_edit_agents,
          ),
        );
        const result = await fetch('/api/workspace/drafts', {
          cache: 'no-store',
        });
        const data = await result.json();
        if (!active) return;
        if (!result.ok) throw new Error(data.error);
        setRecords(data.drafts);
      } catch {
        if (active)
          setMessage(
            'Server drafts could not be loaded. Reload the page to try again.',
          );
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);
  if (!workspace) return null;
  const record = records.find((value) => value.id === selected);
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/workspace/drafts', {
        method: record ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configuration: draft,
          id: record?.id,
          revision: record?.revision,
          workspaceId: workspace,
        }),
      });
      const value = await response.json();
      if (!response.ok) throw new Error(value.error);
      setRecords((current) => [
        value.draft,
        ...current.filter((item) => item.id !== value.draft.id),
      ]);
      setSelected(value.draft.id);
      setMessage(
        'Configuration preview saved on the server. No live deployment was created.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="serverDrafts">
      <summary>Server drafts · selected workspace</summary>
      <p>
        Save a copy of this preview configuration. Resource references remain
        demonstration data.
      </p>
      <label>
        Saved configuration
        <select
          value={selected}
          disabled={busy}
          onChange={(event) => {
            setSelected(event.target.value);
            setMessage('');
          }}
        >
          <option value="">New server copy</option>
          {records
            .filter((value) => value.template_id === draft.templateId)
            .map((value) => (
              <option value={value.id} key={value.id}>
                {value.configuration.name} · revision {value.revision}
              </option>
            ))}
        </select>
      </label>
      <div className="serverDraftActions">
        <Button
          variant="outline"
          disabled={busy || !editable || !draft.name.trim()}
          onClick={save}
        >
          {busy
            ? 'Saving…'
            : record
              ? 'Update server copy'
              : 'Save server copy'}
        </Button>
        <Button
          variant="secondary"
          disabled={!record || busy}
          onClick={() => {
            if (!record) return;
            const restored = parseDraft(
              JSON.stringify(record.configuration),
              draft.templateId,
            );
            if (restored) {
              onLoad(restored);
              setMessage(
                'Server copy loaded. Unsaved form changes were replaced.',
              );
            }
          }}
        >
          Load selected copy
        </Button>
      </div>
      {!editable && <p>This workspace grants read-only access.</p>}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
