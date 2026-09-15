'use client';
import { useEffect, useRef, useState } from 'react';
import { ProviderLogo } from './Assets';
import { Button, Callout } from './UI';
import { approvedActions, type Integration } from '@/lib/launch';

export function IntegrationDialog({
  integration,
  selected,
  selectedActions,
  onClose,
  onSave,
  onRemove,
}: {
  integration: Integration;
  selected: boolean;
  selectedActions: string[];
  onClose: () => void;
  onSave: (actions: string[]) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [actions, setActions] = useState(selectedActions);
  const isTool = Boolean(integration.actions);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      className="integrationDialog"
      ref={ref}
      aria-labelledby="connection-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="dialogHeader">
        <ProviderLogo provider={integration.id} />
        <h2 id="connection-title">Connect {integration.name}</h2>
        <Button
          variant="secondary"
          aria-label="Close connection details"
          onClick={onClose}
        >
          ×
        </Button>
      </div>
      <p>
        Use the approved {isTool ? 'connector' : 'knowledge source'} in your
        workspace.
      </p>
      <div className="resourceDetail">
        <strong>{integration.name}</strong>
        <span>{integration.detail}</span>
        <small>Acme Corp · Demo workspace</small>
      </div>
      {isTool ? (
        <fieldset className="actionPermissions">
          <legend>Allowed actions</legend>
          {integration.actions!.map((action) => (
            <label key={action.id}>
              <input
                type="checkbox"
                checked={actions.includes(action.id)}
                disabled={!action.approved}
                onChange={(event) =>
                  setActions(
                    event.target.checked
                      ? [...actions, action.id]
                      : actions.filter((id) => id !== action.id),
                  )
                }
              />
              <span>
                <strong>{action.name}</strong>
                <small>
                  {action.access} ·{' '}
                  {action.approved
                    ? 'Approved for this workspace'
                    : 'Not approved for this workspace'}
                  {action.requiresApproval && ' · Human approval required'}
                </small>
              </span>
            </label>
          ))}
          <Callout>
            Only selected, approved actions are attached to this agent.
            Connecting a system does not grant access to every action.
          </Callout>
        </fieldset>
      ) : (
        <details className="advancedSettings">
          <summary>Source permissions and readiness</summary>
          <dl>
            <dt>Permission model</dt>
            <dd>Inherit source permissions</dd>
            <dt>Readiness</dt>
            <dd>Ready in the demo registry</dd>
            <dt>Scope</dt>
            <dd>Approved workspace knowledge</dd>
          </dl>
        </details>
      )}
      <div className="dialogActions">
        {selected ? (
          <Button variant="secondary" onClick={onRemove}>
            Remove {isTool ? 'tool' : 'source'}
          </Button>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          disabled={
            isTool && approvedActions(integration.id, actions).length === 0
          }
          onClick={() =>
            onSave(isTool ? approvedActions(integration.id, actions) : [])
          }
        >
          {isTool ? 'Use selected actions' : 'Use source'}
        </Button>
      </div>
    </dialog>
  );
}
