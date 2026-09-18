# Jornada do cliente e recuperação — demonstração frontend

Escopo autorizado: itens 1 e 2, jornada completa e situações reais simuladas. Preserva navegação, marca e oito etapas aprovadas. Nenhuma integração ou envio externo foi adicionado.

## Experimento completo

1. Abra Agents → Catalog e configure um agente no Launch Guide. Defina nome, missão, responsável, fontes, ações, infraestrutura, modelo e controles.
2. Avalie a configuração e revise o manifesto. Production mantém a aprovação explícita da jornada existente.
3. Após a confirmação, use **Open saved agent**. O novo agente, a avaliação e o release ficam registrados no workspace da aba, separados dos agentes de referência.
4. Abra suas abas Knowledge e Tools para conferir as escolhas. As fontes sem inventário detalhado são identificadas com acesso à revisão de sincronização.
5. Em Overview do agente, use **Run sample task**. O resultado simulado atualiza as métricas, a tarefa recente e a auditoria; o agente também está disponível em Agents e AgentOps.
6. Para outra versão, use Create New Version → salvar → avaliar → pedir promoção → Governance. Os pedidos preservam agente/versão e exigem nova avaliação quando a configuração ou o estado das fontes muda.

Persistência: registros operacionais na sessão da aba; o rascunho do Launch Guide mantém a persistência local já existente. Fechar a sessão não equivale a salvar no backend. Cada confirmação de criação gera um novo registro independente.

## Situações e recuperação

| Situação | Como experimentar | Próximo passo |
| --- | --- | --- |
| Fonte desconectada | Knowledge → gerenciador → desconectar uma fonte usada pelo agente criado | A avaliação identifica a fonte indisponível e impede resultado aprovado. Reabrir Knowledge, conectar/sincronizar e reavaliar. |
| Avaliação reprovada | No editor, escolher Fail sample check e executar | Evidência e recomendação explicam a reprovação; promoção não é oferecida. Corrigir o cenário/configuração e reexecutar. |
| Aprovação rejeitada | Governance → Review approvals → informar motivo e rejeitar | Release permanece inativo; histórico conserva o motivo e oferece revisão/reavaliação. Outro pedido pode ser enviado. |
| Deployment com falha | Request promotion → Deployment simulation → Health check fails; submeter e aprovar | Release termina Failed, sem substituir a versão ativa. Histórico/detalhe oferecem recuperação. Selecionar Successful deployment e enviar novo pedido revisado. |
| Orçamento excedido | FinOps → Budget planning → salvar orçamento menor que o gasto ilustrativo | Alerta informa o excesso e abre planejamento/recomendações. Ajustar orçamento remove o alerta; nenhum limite real é aplicado. |

O modo de simulação aparece apenas no editor operacional. Aprovação é uma decisão de revisão; falha de health check é um resultado separado. Aprovar um deployment que falha não desativa outro release.

## Validação

- Build de produção/TypeScript.
- Suíte completa: 44 testes de navegador aprovados na rodada principal, incluindo responsividade e acessibilidade existentes.
- Novos testes em `ai-platform/tests/customer-journey.spec.ts`: criação→persistência→inventário→monitoramento; fonte indisponível; falha/reprovação/rejeição e nova tentativa; orçamento excedido e correção.
- Regressão focada após a conferência final dos dados de agentes criados, incluindo aprovação de versões e histórico individual.
- O estado da fonte desconectada é injetado no teste da jornada para isolar o bloqueio de avaliação. O fluxo visual de desconectar/conectar/sincronizar continua coberto pela suíte de Resources.

Não há consumo de modelo, ingestão, tarefa real, cobrança, notificação ou infraestrutura provisionada. As tarefas de acompanhamento são explicitamente simuladas; não inventam histórico anterior ao agente criado.
