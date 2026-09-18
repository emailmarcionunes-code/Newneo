import { randomUUID } from 'node:crypto';
export type NotificationDB = {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
};
export type CostEvent = {
  id: string;
  kind: string;
  recipient: string;
  payload: Record<string, unknown>;
  created_at: Date | string;
  attempts: number;
};
const money = (v: unknown) =>
  typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD',
      }).format(v / 100)
    : 'não disponível';
export function renderCostNotice(e: CostEvent) {
  const p = e.payload;
  const customer = e.kind.startsWith('customer-');
  const subject = customer
    ? 'NEWNEO: limite de clientes / aprovação necessária'
    : 'NEWNEO: aviso de consumo / revisão de orçamento';
  const lines = [
    subject,
    `Evento: ${e.id}`,
    `Registrado em: ${new Date(e.created_at).toISOString()}`,
    '',
  ];
  if (customer) {
    lines.push(
      `Empresas ativas: ${p.count ?? 'não disponível'}`,
      `Limite aprovado: ${p.limit ?? 'não disponível'}`,
      'O próximo cliente depende de um aumento aprovado pelo responsável da plataforma.',
    );
  } else {
    lines.push(
      `Período (UTC): ${p.period ?? 'não disponível'}`,
      `Consumo + reservas e provisão de infraestrutura: ${money(p.usedCents)}`,
      `Limite aprovado: ${money(p.limitCents)}`,
    );
    if (p.requestedCents !== undefined)
      lines.push(
        `Custo máximo da operação solicitada: ${money(p.requestedCents)}`,
      );
    if (p.threshold !== undefined)
      lines.push(`Patamar alcançado: ${p.threshold}%`);
    if (e.kind === 'spend-approval-required')
      lines.push(
        'Motivo: a nova operação excederia o orçamento aprovado. A operação não foi autorizada.',
      );
    if (e.kind === 'spend-threshold')
      lines.push(
        'Motivo: consumo e compromissos reservados alcançaram o patamar de aviso.',
      );
    lines.push(
      '',
      'Principais componentes registrados (incluem reservas, não apenas cobrança realizada):',
    );
    for (const d of (Array.isArray(p.drivers) ? p.drivers : []).slice(0, 10)) {
      if (d && typeof d === 'object')
        lines.push(
          `- ${String(d.service ?? 'serviço')} / empresa ${String(d.organization_id ?? 'não identificada')}: ${money(Number(d.cents))}`,
        );
    }
    lines.push(
      'A projeção mensal da fatura é enviada separadamente pelo AWS Budgets. Esta mensagem não é uma fatura em tempo real.',
    );
  }
  lines.push(
    '',
    'Para liberar mais capacidade, o responsável deve aprovar um novo limite explícito pelo processo administrativo da plataforma. Responder a este e-mail não aumenta o limite. Sem aprovação, o limite permanece.',
    'Custos fixos e operações já iniciadas podem continuar gerando cobrança.',
  );
  return { subject, message: lines.join('\n').slice(0, 20000) };
}
/** Atomic lease permits several workers. SNS/email is at-least-once: a crash
 * after publication can repeat an event, always with the same event ID. */
export async function dispatchCostNotice(
  db: NotificationDB,
  send: (e: CostEvent) => Promise<string>,
) {
  const token = randomUUID();
  const {
    rows: [event],
  } = await db.query<CostEvent>(
    `WITH candidate AS (
 SELECT id FROM newneo_cost.events WHERE published_at IS NULL AND next_attempt_at<=now()
 AND (lease_until IS NULL OR lease_until<now())
 AND kind IN ('customer-limit-reached','customer-approval-required','spend-threshold','spend-approval-required')
 ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1)
 UPDATE newneo_cost.events e SET lease_token=$1,lease_until=now()+interval '2 minutes',attempts=e.attempts+1
 FROM candidate c WHERE e.id=c.id RETURNING e.*`,
    [token],
  );
  if (!event) return 'idle';
  try {
    const messageId = await send(event);
    if (!messageId) throw new Error('Missing provider receipt');
    const saved = await db.query(
      `UPDATE newneo_cost.events SET published_at=now(),provider_message_id=$3,lease_token=NULL,lease_until=NULL,last_error=NULL WHERE id=$1 AND lease_token=$2 RETURNING id`,
      [event.id, token, messageId],
    );
    if (!saved.rows.length) throw new Error('Lease lost');
    return 'published';
  } catch {
    const delay = Math.min(3600, 30 * 2 ** Math.min(event.attempts - 1, 7));
    await db.query(
      `UPDATE newneo_cost.events SET lease_token=NULL,lease_until=NULL,last_error='Publication failed; check worker credentials, confirmed subscription and provider health.',next_attempt_at=now()+($3*interval '1 second') WHERE id=$1 AND lease_token=$2`,
      [event.id, token, delay],
    );
    return 'retry';
  }
}
