import { launchSteps } from '@/lib/launch';
export function LaunchStepper({
  current,
  onStep,
}: {
  current: number;
  onStep: (step: number) => void;
}) {
  return (
    <nav className="launchStepper" aria-label="Launch progress">
      <ol>
        {launchSteps.map((label, index) => (
          <li
            key={label}
            className={
              index < current ? 'complete' : index === current ? 'current' : ''
            }
          >
            <button
              type="button"
              aria-current={index === current ? 'step' : undefined}
              aria-label={`${label}${index < current ? ', completed' : index === current ? ', current step' : ', upcoming'}`}
              disabled={index > current}
              onClick={() => onStep(index)}
            >
              <span className="stepCircle" aria-hidden="true">
                {index < current ? '✓' : index + 1}
              </span>
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
