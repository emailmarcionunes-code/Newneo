import { useRef } from 'react';
import { AssetIcon } from './Assets';
import { Button } from './UI';
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
      <p>
        Next, choose a provider and compare models available for this
        infrastructure.
      </p>
    </section>
  );
}
