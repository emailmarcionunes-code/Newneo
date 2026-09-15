import { useRef } from 'react';
import { AssetIcon } from './Assets';
import { Button, SelectField } from './UI';
import {
  defaultRuntime,
  endpointsFor,
  executionModels,
  type RuntimeSelection,
} from '@/lib/configuration';

export function ModelRuntimeStep({
  value,
  onChange,
}: {
  value: RuntimeSelection;
  onChange: (value: RuntimeSelection) => void;
}) {
  const choices = useRef<HTMLDivElement>(null);
  const endpoints = endpointsFor(value.executionModel);
  const endpoint = endpoints.find((item) => item.id === value.endpointId);
  const usingDefault = value.executionModel === 'organization-default';
  return (
    <section
      className="modelRuntimeStep"
      aria-label="Model and runtime configuration"
    >
      <div className={`organizationDefault ${usingDefault ? 'selected' : ''}`}>
        <div>
          <h3>Organization Default · Recommended</h3>
          <p>Customer Cloud · US East · Approved enterprise model endpoint</p>
        </div>
        <Button
          variant="link"
          onClick={() => {
            if (!usingDefault) onChange(defaultRuntime());
            else
              choices.current
                ?.querySelector<HTMLButtonElement>('button')
                ?.focus();
          }}
        >
          {usingDefault
            ? 'Change execution model →'
            : 'Use organization default'}
        </Button>
      </div>
      <div
        ref={choices}
        className="executionGrid"
        role="group"
        aria-label="Execution model"
      >
        {executionModels.map((model) => (
          <button
            type="button"
            key={model.id}
            className={`executionCard ${model.id}`}
            aria-pressed={value.executionModel === model.id}
            onClick={() =>
              onChange({
                executionModel: model.id,
                endpointId: endpointsFor(model.id)[0]?.id ?? '',
              })
            }
          >
            <span className="executionIcon">
              <AssetIcon name={`runtime-${model.id}`} size={20} />
            </span>
            <strong>{model.name}</strong>
            <span>{model.description}</span>
          </button>
        ))}
      </div>
      <div className="modelEndpointColumns">
        <div>
          <SelectField
            id="approved-model"
            label="Approved model"
            value={value.endpointId}
            disabled={!endpoints.length}
            onChange={(event) =>
              onChange({ ...value, endpointId: event.target.value })
            }
          >
            {!endpoints.length && (
              <option value="">No approved endpoints available</option>
            )}
            {endpoints.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectField>
          {!endpoint && (
            <p className="modelUnavailable" role="status">
              No approved endpoint is available for this execution model in the
              preview. Choose Customer Cloud or use the organization default to
              continue.
            </p>
          )}
        </div>
        {endpoint && (
          <dl className="modelMetrics" aria-label="Model estimates">
            <div>
              <dt>Context window</dt>
              <dd>{endpoint.contextWindow}</dd>
            </div>
            <div>
              <dt>Estimated cost</dt>
              <dd>{endpoint.estimatedCost}</dd>
            </div>
            <div>
              <dt>Expected latency</dt>
              <dd>{endpoint.expectedLatency}</dd>
            </div>
          </dl>
        )}
      </div>
      <details className="advancedSettings modelAdvanced">
        <summary>Advanced settings (optional)</summary>
        {endpoint ? (
          <dl>
            <dt>Execution model</dt>
            <dd>Customer Cloud</dd>
            <dt>Region</dt>
            <dd>{endpoint.region}</dd>
            <dt>Endpoint</dt>
            <dd>{endpoint.name}</dd>
            <dt>Availability</dt>
            <dd>Demo organization and workspace</dd>
          </dl>
        ) : (
          <p>Choose an approved endpoint to view its details.</p>
        )}
        <p>
          Preview configuration only. Estimates are reference values from the
          approved design, not live measurements. Endpoint provisioning and
          inference settings are managed by your organization.
        </p>
      </details>
    </section>
  );
}
