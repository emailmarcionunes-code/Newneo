# Fechamento antes da AWS — 16/09/2026

> Registro anterior à extensão de Skills. Para o parecer atual, nove abas de Agent Detail, 54 testes de navegador e pendências de integração, consulte [Auditoria final AWS](FINAL_AWS_INTEGRATION_AUDIT_2026-09-16.md). Os números abaixo são históricos daquela rodada.

## Escopo da versão

Customer AI Platform visual e navegável, seguindo as referências aprovadas. Nenhuma nova área principal necessária foi identificada no inventário desta rodada. Isso não equivale a uma plataforma conectada ou homologação de produção.

## 1. Jornada completa

Os testes percorrem catálogo e criação customizada, oito etapas do Launch Guide, persistência do agente, tarefa simulada, configuração, avaliação, revisão e promoção. Incluem avaliação reprovada, aprovação rejeitada, falha de deployment, recuperação, pausa/retomada e rollback, sem executar sistemas externos. Agente e versão permanecem ligados aos registros corretos.

## 2. Telas, subtelas e estados

| Área | Cobertura validada / estados relevantes |
| --- | --- |
| Overview | Indicadores, saúde, atividades e atalhos; atualização de dados de demonstração |
| Agents | Inventário/filtros, catálogo/custom, guia de oito etapas, sucesso; oito abas no detalhe |
| Knowledge | Listagem, criação, configuração, edição, documentos, Sync, erro/retry e desconexão |
| Tools & MCP | Tabela, aba de servidores, configuração, ações/permissões e detalhe/teste simulado |
| Models | Página contextual, cadastro, edição, teste e seleção de defaults |
| Evaluations | Execuções, detalhes, suítes, avaliação/reprovação e retorno à configuração |
| Governance | Políticas, edição, violações, audit, fila de aprovação e rejeição |
| Deployments | Ambientes, histórico, detalhe, promoção, falha, pausa/retomada e rollback |
| AgentOps | Incidents/Logs/Health, detalhe, resolução e filtros vazios |
| FinOps | Custos, orçamento, alerta de excesso e correção do orçamento |
| Reports | Período/custom, desempenho, exportação CSV/print-PDF e agenda local |
| Playground | Estado vazio, sugestões, seleção de agente, conversa simulada, limpar |
| Audit Log | Eventos locais, busca, filtros, exportação |
| Settings | Organization, Team & Roles, API & Webhooks, Integrations, Notifications, Getting Started |
| Shell | Busca/ajuda/perfil/notificações; sidebar manual e estático entre rotas |
| Entrada/recuperação | Login e SSO indisponível, erro amigável, 404; retorno ao preview |
| Permissões/estado | Perfis da demo, workspace vazio, restauração de exemplos, persistência/reload |

A cobertura automatizada inclui 390, 768, 1180 e 1440px, navegação por teclado em controles principais e axe nos estados testados. Não é certificação de acessibilidade integral ou comparação pixel a pixel.

## 3. Consistência corrigida nesta rodada

- Overview passa a consumir os agentes atuais da sessão, incluindo os criados no guia, em vez de uma lista fixa de cinco registros.
- Tarefas, gasto, readiness e taxa de sucesso vêm de um cálculo comum. Overview, AgentOps e Reports usam taxa ponderada pelas tarefas com medição válida; ausência de medição aparece como “—”.
- Contadores de execuções/falhas em Evaluations e Overview acompanham as linhas exibidas.
- Pausa/ativação de releases Production também atualiza o status de agentes de referência no inventário.
- Incidente resolvido não continua indicando risco ativo no detalhe.
- Percentual de orçamento acima de 100% mantém o valor numérico real, com a barra limitada à largura disponível.
- A identificação de dados simulados ficou explícita nas telas.

Limites conhecidos e intencionais: séries históricas, latência, compliance, recomendações e alguns metadados continuam sendo snapshots de referência. Períodos de Reports simulam totais a partir da atividade diária; não são uma série histórica coletada. Chaves, servidores MCP, convites, notificações e agendas da demo não ativam serviços. O modo demo usa o armazenamento da aba; não deve ser migrado automaticamente para produção.

## 4. Contratos e handoff

Ver `ai-platform/contracts/README.md` e `platform-v1.openapi.json`: contrato OpenAPI 3.1 proposto, 46 paths e 67 operações, schemas, paginação, jobs/progresso, erros, revisão, idempotência e evidência de aprovação. As referências locais dos schemas foram verificadas. `/api/v1` não foi implementado por este trabalho.

As APIs existentes de sessão, seleção de workspace, rascunhos e preview estão inventariadas separadamente. O deploy real continua bloqueado. O contrato não altera silenciosamente o formato das respostas atuais.

## 5. Versão estável e próximo estágio

Branch: `newneo-ai-platform-v1`. A versão será marcada localmente como `newneo-pre-aws-v1`. Não houve push, publicação ou alteração de conta AWS.

Próxima etapa de integração, em ordem:

1. Inventariar conta/região/recursos existentes da AWS e estimar o custo da configuração mínima, considerando o objetivo de cerca de US$25/mês. Confirmar preços e custos variáveis no momento da escolha; este documento não promete um preço AWS.
2. Preparar um ambiente de staging, identidade e workspace; separar credenciais de migração das de runtime, conforme a fundação já existente.
3. Persistir agentes/rascunhos e testar isolamento entre workspaces, revisões concorrentes, backup e restauração.
4. Integrar uma fonte, um modelo e uma ferramenta com limites observáveis; executar avaliação real em staging.
5. Ligar aprovação e worker de deployment, métricas/custo/auditoria. Só então liberar produção.

Variáveis exigidas e placeholders estão em `ai-platform/.env.example`; segredos reais não foram solicitados ou armazenados neste fechamento. Consulte também `NEWNEO_BACKEND_FOUNDATION.md` e `NEWNEO_PILOT_DEPLOYMENT.md` para a fundação existente.

Critério de entrada em produção: isolamento de tenant e identidade testados, evidencia real de avaliação/aprovação, segredos fora do frontend, jobs idempotentes, rollback, backup/restauração e medição de custo demonstrados. Esses itens pertencem à integração, não à conclusão visual.

## Resultado final

- Build de produção e validação TypeScript: aprovados.
- Navegador: **51 testes aprovados**, incluindo jornada completa, perfis, estados de falha/recuperação, sidebar estático, layouts e consistência entre telas.
- Unitários: **25 aprovados**, sem falhas; **1 teste de integração PostgreSQL opcional ignorado** por ausência do ambiente externo.
- Contrato: referências locais dos schemas/respostas resolvidas; contrato proposto, não endpoint em funcionamento.
- `git diff --check`: sem erros de whitespace.
- A rodada final usou build concluído e estável. Uma rodada intermediária foi descartada após recompilação durante sua execução; não é usada como evidência de aprovação.
