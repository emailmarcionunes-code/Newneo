import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { ProviderLogo } from './Assets';

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'add' | 'link';
}) {
  return (
    <button
      type={type}
      className={`button ${variant} ${className}`}
      {...props}
    />
  );
}
export function FilterChip({
  active,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      className={`chip${active ? ' active' : ''}`}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}
export function FormField({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}
export function SelectField({
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {children}
      </select>
    </div>
  );
}
export function ContextPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`contextPanel ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Callout({
  children,
  tone = 'success',
}: {
  children: ReactNode;
  tone?: 'success' | 'info' | 'warning';
}) {
  return (
    <div className={`callout ${tone}`}>
      {tone === 'info' && <span aria-hidden="true">“</span>}
      <div>{children}</div>
    </div>
  );
}
export function IntegrationTile({
  provider,
  name,
  caption,
  onConnect,
}: {
  provider: string;
  name: string;
  caption?: string;
  onConnect: () => void;
}) {
  return (
    <article className={`integrationTile${caption ? ' withCaption' : ''}`}>
      <ProviderLogo provider={provider} />
      <h3>{name}</h3>
      {caption && <p>{caption}</p>}
      <Button
        variant="outline"
        aria-label={`Connect ${name}`}
        onClick={onConnect}
      >
        Connect
      </Button>
    </article>
  );
}
export function EnvironmentOption({
  name,
  description,
  selected,
  onChange,
  disabled,
}: {
  name: string;
  description: string;
  selected: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={`environmentOption${selected ? ' selected' : ''}`}>
      <input
        type="radio"
        name="environment"
        checked={selected}
        onChange={onChange}
        disabled={disabled}
      />
      <span>
        <strong>{name}</strong>
        <small>{description}</small>
      </span>
    </label>
  );
}
export function ProgressRing({ value }: { value: number }) {
  const normalized = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
  return (
    <div
      className="progressRing"
      role="meter"
      aria-label="Evaluation score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
      style={{
        background: `conic-gradient(var(--success) ${normalized}%, var(--line) 0)`,
      }}
    >
      <div>
        <strong>{normalized}%</strong>
        <small>Overall score</small>
      </div>
    </div>
  );
}
