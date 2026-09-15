import { useEffect, useRef } from 'react';
import { launchSteps } from '@/lib/launch';
export function LaunchStepper({
  current,
  onStep,
}: {
  current: number;
  onStep: (step: number) => void;
}) {
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navigation.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const bounds = nav.getBoundingClientRect();
    const target = active.getBoundingClientRect();
    nav.scrollTo({
      left:
        nav.scrollLeft +
        target.left -
        bounds.left -
        (nav.clientWidth - target.width) / 2,
    });
  }, [current]);
  return (
    <nav
      ref={navigation}
      className="launchStepper"
      aria-label="Launch progress"
    >
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
