'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
export const roles = [
  'Organization Admin',
  'AI Platform Admin',
  'AI Engineer',
  'Business Owner',
  'Operator',
  'Reviewer / Approver',
  'Read Only',
];
export const suiteTypes = [
  'Functional',
  'RAG / Groundedness',
  'Tool execution',
  'Governance',
  'Security',
  'Regression',
  'Business KPI',
];
export type Endpoint = {
  id: string;
  name: string;
  provider: string;
  url: string;
  runtime: string;
  region: string;
  classification: string;
  status: string;
};
export type Suite = {
  id: string;
  name: string;
  category: string;
  question: string;
  expected: string;
  mandatory: boolean;
};
export type Run = {
  agentId?: string;
  configuration?: string;
  id: string;
  suiteId: string;
  category: string;
  question: string;
  expected: string;
  name: string;
  version: string;
  passed: boolean;
  score: number;
};
export type Release = {
  agentId?: string;
  id: string;
  runId: string;
  version: string;
  source: string;
  target: string;
  state: 'Pending approval' | 'Rejected' | 'Active' | 'Paused' | 'Rolled back';
  reason: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  state: string;
};
export type Policy = {
  id: string;
  name: string;
  scope: string;
  approval: boolean;
  description: string;
};
export type PreviewState = {
  version: 1;
  ui?: Record<string, unknown>;
  endpoints: Endpoint[];
  defaultModel: string;
  workspaceModel: string;
  suites: Suite[];
  runs: Run[];
  releases: Release[];
  users: User[];
  policies: Policy[];
  audit: string[];
  budget: number;
  alert: number;
  incidentStates: Record<string, string>;
};
const initial: PreviewState = {
  version: 1,
  endpoints: [
    {
      id: 'default',
      name: 'GPT-4o · approved endpoint',
      provider: 'Organization-approved provider',
      url: '',
      runtime: 'Customer Cloud',
      region: 'US East',
      classification: 'Not assigned',
      status: 'Not tested',
    },
  ],
  defaultModel: 'default',
  workspaceModel: '',
  suites: [
    {
      id: 'regression',
      name: 'Customer Service regression',
      category: 'Regression',
      question: 'How do I check the status of an order?',
      expected: 'Answer cites the current order support policy.',
      mandatory: true,
    },
  ],
  runs: [],
  releases: [],
  users: [
    {
      id: 'ana',
      name: 'Ana Martinez',
      email: 'ana@example.com',
      role: 'AI Engineer',
      state: 'Active · sample',
    },
  ],
  policies: [
    {
      id: 'production',
      name: 'Production change control',
      scope: 'Organization',
      approval: true,
      description:
        'Evaluate new versions and require approval before production.',
    },
  ],
  audit: [],
  budget: 2800,
  alert: 80,
  incidentStates: {},
};
const Context = createContext<{
  state: PreviewState;
  update: (action: (state: PreviewState) => PreviewState) => void;
  ready: boolean;
  storageError: boolean;
} | null>(null);
function valid(value: unknown): value is PreviewState {
  if (!value || typeof value !== 'object') return false;
  const s = value as PreviewState;
  if (
    s.version !== 1 ||
    (s.ui !== undefined &&
      (!s.ui || typeof s.ui !== 'object' || Array.isArray(s.ui))) ||
    typeof s.defaultModel !== 'string' ||
    typeof s.workspaceModel !== 'string' ||
    !Number.isFinite(s.budget) ||
    s.budget <= 0 ||
    !Number.isFinite(s.alert) ||
    s.alert < 1 ||
    s.alert > 100
  )
    return false;
  const strings = (v: unknown, keys: string[]) =>
    !!v &&
    typeof v === 'object' &&
    keys.every(
      (k) =>
        typeof (v as Record<string, unknown>)[k] === 'string' &&
        (v as Record<string, string>)[k].length <= 4000,
    );
  return (
    Array.isArray(s.endpoints) &&
    s.endpoints.length <= 100 &&
    s.endpoints.every((e) =>
      strings(e, [
        'id',
        'name',
        'provider',
        'url',
        'runtime',
        'region',
        'classification',
        'status',
      ]),
    ) &&
    Array.isArray(s.suites) &&
    s.suites.length <= 100 &&
    s.suites.every(
      (e) =>
        strings(e, ['id', 'name', 'category', 'question', 'expected']) &&
        typeof e.mandatory === 'boolean',
    ) &&
    Array.isArray(s.runs) &&
    s.runs.every(
      (e) =>
        strings(e, [
          'id',
          'suiteId',
          'name',
          'version',
          'category',
          'question',
          'expected',
        ]) &&
        typeof e.passed === 'boolean' &&
        Number.isFinite(e.score),
    ) &&
    Array.isArray(s.releases) &&
    s.releases.every(
      (e) =>
        strings(e, [
          'id',
          'runId',
          'version',
          'source',
          'target',
          'state',
          'reason',
        ]) &&
        [
          'Pending approval',
          'Rejected',
          'Active',
          'Paused',
          'Rolled back',
        ].includes(e.state),
    ) &&
    Array.isArray(s.users) &&
    s.users.every((e) =>
      strings(e, ['id', 'name', 'email', 'role', 'state']),
    ) &&
    Array.isArray(s.policies) &&
    s.policies.every(
      (e) =>
        strings(e, ['id', 'name', 'scope', 'description']) &&
        typeof e.approval === 'boolean',
    ) &&
    Array.isArray(s.audit) &&
    s.audit.every((e) => typeof e === 'string') &&
    !!s.incidentStates &&
    typeof s.incidentStates === 'object' &&
    Object.values(s.incidentStates).every((e) => typeof e === 'string')
  );
}
export function PreviewStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('newneo:customer-journeys:v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (valid(parsed)) setState(parsed);
        else setStorageError(true);
      }
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        'newneo:customer-journeys:v1',
        JSON.stringify(state),
      );
    } catch {
      setStorageError(true);
    }
  }, [state, ready]);
  return (
    <Context.Provider value={{ state, update: setState, ready, storageError }}>
      {children}
    </Context.Provider>
  );
}
export function usePreview() {
  const context = useContext(Context);
  if (!context) throw new Error('Preview provider missing');
  return context;
}
export const identifier = () => crypto.randomUUID();

/** Persistent demo values share the root provider; no backend or credentials. */
export function usePreviewValue<T>(
  key: string,
  fallback: T,
): [T, (next: T | ((previous: T) => T)) => void] {
  const { state, update } = usePreview();
  const stored = state.ui?.[key];
  const compatible = (value: unknown): value is T =>
    value !== undefined &&
    (Array.isArray(fallback)
      ? Array.isArray(value)
      : typeof value === typeof fallback &&
        (fallback === null || value !== null));
  const value = compatible(stored) ? stored : fallback;
  function setValue(next: T | ((previous: T) => T)) {
    update((current) => {
      const previous = current.ui?.[key];
      const resolved = compatible(previous) ? previous : fallback;
      return {
        ...current,
        ui: {
          ...current.ui,
          [key]:
            typeof next === 'function' ? (next as (v: T) => T)(resolved) : next,
        },
      };
    });
  }
  return [value, setValue];
}
