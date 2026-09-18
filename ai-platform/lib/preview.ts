export const environments = [
  { name: 'Development', description: 'For internal testing' },
  { name: 'Staging', description: 'Pre-production testing' },
  { name: 'Production', description: 'Live for end users' },
] as const;
export type Environment = (typeof environments)[number]['name'];
export type ReferenceEvaluation = {
  mode: 'preview';
  token: string;
  score: number;
  metrics: { name: string; value: number }[];
  cases: { status: 'Passed' | 'Needs review' | 'Failed'; count: number }[];
};
export type PreviewDeployment = {
  mode: 'preview';
  environment: Environment;
  agentName: string;
  deployed: false;
};
// This is the reference conversation from Figma 14:341, not a live order lookup.
export const sampleQuestion = 'Where is my order #12345?';
export const sampleAnswer =
  'Your order #12345 was shipped on Sep 10, 2026 and is expected to arrive on Sep 14, 2026. You can track it here.';
export async function previewRequest<T>(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch('/api/launch/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, mode: 'preview' }),
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error ?? 'Preview request failed. Please try again.');
  if (data.mode !== 'preview')
    throw new Error('Unexpected preview response. Please try again.');
  return data as T;
}
