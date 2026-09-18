/** Current preview snapshot. Historical series must come from the future API. */
export type SummaryAgent = {
  tasks: string;
  success: string;
  score: number;
  cost: number;
};
export function workspaceSummary(agents: readonly SummaryAgent[]) {
  let tasks = 0,
    successfulTasks = 0,
    measuredTasks = 0,
    spend = 0,
    scores = 0,
    scored = 0;
  for (const agent of agents) {
    const count = Number(agent.tasks.replaceAll(',', ''));
    const rate = parseFloat(agent.success);
    const validTasks = Number.isFinite(count) && count >= 0 ? count : 0;
    tasks += validTasks;
    if (Number.isFinite(rate) && rate >= 0 && rate <= 100) {
      measuredTasks += validTasks;
      successfulTasks += (validTasks * rate) / 100;
    }
    if (Number.isFinite(agent.cost) && agent.cost >= 0) spend += agent.cost;
    if (Number.isFinite(agent.score)) {
      scores += agent.score;
      scored++;
    }
  }
  return {
    tasks,
    spend,
    successfulTasks,
    successRate: measuredTasks ? (successfulTasks / measuredTasks) * 100 : null,
    readiness: scored ? scores / scored : null,
  };
}
export function percent(value: number | null) {
  return value === null ? '—' : `${Number(value.toFixed(1))}%`;
}
