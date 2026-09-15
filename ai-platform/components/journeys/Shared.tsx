'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '../UI';
import { usePreview } from './PreviewState';
export function PreviewNotice() {
  const { storageError } = usePreview();
  return (
    <div className="surfaceNotice">
      <strong>Interactive preview</strong>
      <p>
        Explore with sample data. Changes stay in this tab; no systems, messages
        or payments are triggered.
      </p>
      {storageError && (
        <p>
          Browser storage could not be restored or saved. You can continue in
          this session.
        </p>
      )}
    </div>
  );
}
export function JourneyHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <>
      <div className="pageHead">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </div>
      <PreviewNotice />
    </>
  );
}
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="journeyDialog"
      aria-labelledby="journey-dialog-title"
      onCancel={onClose}
    >
      <div className="surfaceHeading">
        <h2 id="journey-dialog-title">{title}</h2>
        <Button variant="secondary" onClick={onClose} aria-label="Close dialog">
          ×
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="journeyField">
      {label}
      {children}
    </label>
  );
}
export function Tabs({
  names,
  current,
  onChange,
}: {
  names: string[];
  current: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="resourceTabs" role="tablist" aria-label="Sections">
      {names.map((name, index) => (
        <button
          key={name}
          id={`journey-tab-${index}`}
          role="tab"
          aria-selected={current === name}
          aria-controls="journey-panel"
          tabIndex={current === name ? 0 : -1}
          onClick={() => onChange(name)}
          onKeyDown={(event) => {
            let target = index;
            if (event.key === 'ArrowRight') target = (index + 1) % names.length;
            else if (event.key === 'ArrowLeft')
              target = (index + names.length - 1) % names.length;
            else if (event.key === 'Home') target = 0;
            else if (event.key === 'End') target = names.length - 1;
            else return;
            event.preventDefault();
            onChange(names[target]);
            document.getElementById(`journey-tab-${target}`)?.focus();
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
export function Panel({
  names,
  current,
  children,
}: {
  names: string[];
  current: string;
  children: ReactNode;
}) {
  return (
    <section
      id="journey-panel"
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={`journey-tab-${names.indexOf(current)}`}
    >
      {children}
    </section>
  );
}
export function Feedback({ message }: { message: string }) {
  return message ? (
    <p role="status" className="resourceNotice">
      {message}
    </p>
  ) : null;
}
