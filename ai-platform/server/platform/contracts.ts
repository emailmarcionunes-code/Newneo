/** NEWNEO execution contracts. Server-only design surface, not live adapters. */
import type { SqlClient, WorkspaceScope } from '../agent-repository';
export type Scope = WorkspaceScope;
export type Environment = 'development' | 'staging' | 'production';
export type DeploymentMode =
  'newneo-managed' | 'customer-cloud' | 'private-ai' | 'hybrid-ai';
export type IdentityContext = Scope & { identityId: string };
export type TaskContext = IdentityContext & {
  taskId: string;
  agentId: string;
  agentVersionId: string;
  environment: Environment;
  correlationId: string;
};
/** Immutable NEWNEO references; never provider-native Agent or Skill IDs. */
export type AgentVersionPlan = Scope & {
  agentId: string;
  agentVersionId: string;
  mission: string;
  businessOwnerId: string;
  targetUsers: string[];
  skillBindingIds: string[];
  knowledgeBindingIds: string[];
  toolActionIds: string[];
  modelEndpointId: string;
  policyIds: string[];
  evaluationRunIds: string[];
};
export type ModelEndpoint = {
  id: string;
  providerClass: 'managed' | 'direct-api' | 'customer-endpoint' | 'private';
  modelFamily: string;
  capabilities: string[];
  region: string;
  context: number;
  latencyProfile: string;
  costProfile: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
};
/** Internal configuration stored separately, never serialized into public Agent DTOs. */
export type ExecutionBinding = Scope & {
  id: string;
  agentVersionId: string;
  mode: DeploymentMode;
  providerKey: string;
  providerConfigRef: string;
};
export type RuntimeResult = {
  taskId: string;
  status: 'completed' | 'failed' | 'awaiting-approval';
  resultRef?: string;
};
export interface AgentRuntimeProvider {
  execute(
    context: TaskContext,
    plan: AgentVersionPlan,
    binding: ExecutionBinding,
  ): Promise<RuntimeResult>;
}
export interface ModelProvider {
  invoke(
    context: TaskContext,
    endpoint: ModelEndpoint,
    inputRef: string,
  ): Promise<{ outputRef: string; inputTokens: number; outputTokens: number }>;
}
export interface KnowledgeProvider {
  retrieve(
    context: TaskContext,
    bindingId: string,
    query: string,
  ): Promise<{ documentId: string; excerpt: string; score: number }[]>;
}
export interface ObjectStorageProvider {
  put(scope: Scope, objectId: string, bytes: Uint8Array): Promise<void>;
  get(scope: Scope, objectId: string): Promise<Uint8Array>;
}
export interface SecretsProvider {
  resolve(scope: Scope, secretRef: string): Promise<string>;
}
export interface IdentityProvider {
  verify(
    token: string,
  ): Promise<{ issuer: string; subject: string; expiresAt: number }>;
}
export interface ObservabilityProvider {
  publish(event: PlatformEvent): Promise<void>;
}
export interface QueueProvider {
  enqueue(
    scope: Scope,
    message: { id: string; taskId: string; payloadRef: string },
  ): Promise<void>;
}
/** SQL stays inside repositories; a new DB engine requires repository adaptation. */
export interface DatabaseProvider {
  withIdentity<T>(
    identity: IdentityContext,
    action: (db: SqlClient) => Promise<T>,
  ): Promise<T>;
}
export interface ToolExecutionProvider {
  execute(
    context: TaskContext,
    actionId: string,
    inputRef: string,
    authorizationRef: string,
  ): Promise<{ outputRef: string }>;
}
export interface PolicyEnforcementProvider {
  evaluate(
    context: TaskContext,
    actionId: string,
  ): Promise<
    | { decision: 'allow'; authorizationRef: string }
    | { decision: 'deny'; policyId: string }
    | { decision: 'require-approval'; approvalId: string }
  >;
}
export interface CostProvider {
  readUsage(
    scope: Scope,
    cursor?: string,
  ): Promise<{ charges: UsageCharge[]; nextCursor?: string }>;
}
export const eventTypes = [
  'TaskStarted',
  'TaskCompleted',
  'TaskFailed',
  'SkillInvoked',
  'SkillCompleted',
  'ToolCalled',
  'ToolFailed',
  'ModelInvoked',
  'KnowledgeRetrieved',
  'PolicyTriggered',
  'ApprovalRequested',
  'DeploymentChanged',
  'IncidentOpened',
] as const;
export type EventType = (typeof eventTypes)[number];
export type PlatformEvent = Scope & {
  id: string;
  type: EventType;
  occurredAt: string;
  correlationId: string;
  environment: Environment;
  taskId?: string;
  agentId?: string;
  agentVersionId?: string;
  skillId?: string;
  modelEndpointId?: string;
  resourceId?: string;
};
/** One immutable charge per provider usage item, not one billable Task per call. */
export type UsageCharge = Scope & {
  id: string;
  taskId: string;
  agentId: string;
  skillId?: string;
  modelEndpointId?: string;
  environment: Environment;
  occurredAt: string;
  currency: 'USD';
  amountMicros: number;
};
