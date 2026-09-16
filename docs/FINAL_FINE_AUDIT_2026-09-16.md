# Auditoria fina — NEWNEO Customer AI Platform

Data: 16/09/2026. Código auditado: `9900b38`, branch `newneo-ai-platform-v1`. Preview: porta 3117.

## Conclusão

As páginas principais enumeradas na Issue #3 estão implementadas e navegáveis. Isso não significa que todos os estados e percursos estejam completos: há inconsistências entre listagens e detalhes, alterações que se perdem ao sair da tela, subtelas com apresentação anterior e algumas experiências de apoio ausentes.

Recomendação: corrigir os itens A1–A7 antes de encerrar a demonstração frontend. Os demais itens podem compor uma rodada curta de acabamento ou uma decisão de escopo. Nenhuma interface ou funcionalidade foi alterada nesta auditoria.

## Método e limites

- Conferência da Issue #3 atual pelo conector GitHub, rotas, componentes, roadmap e auditorias existentes. A Issue v4 prevalece sobre os estados antigos “design pending” do roadmap.
- Reexecução da suíte existente: **32 testes de navegador passaram** em 36,8 segundos, incluindo fluxos, acessibilidade automatizada e reflow em 390, 768, 1180 e 1440px.
- Investigação adicional em sessão isolada do navegador: perda de rascunho, incidente/listagem, links de avaliações, documentos de fonte com erro, subtelas operacionais, detalhe de deployment e página inexistente.
- `/models`, ausente da matriz automatizada anterior, foi verificada em 1343 e 390px: sem overflow da página e sem violações axe em `main` nesses estados.
- Revisão de capturas de Models e editores operacionais. Esta não é certificação de equivalência de pixels com cada frame Figma nem auditoria de segurança/produção.
- Os testes existentes não cobriam as contradições encontradas abaixo. Passar nos testes não comprova completude de produto.

## Correções recomendadas antes de fechar

| ID | Prioridade | Achado e evidência | Ajuste proposto |
|---|---|---|---|
| A1 | Alta | Em `/agents/it-support`, criar versão, editar missão e salvar mostra “Draft v2.5 saved”. Após recarregar, a missão original reaparece e o formulário volta a ficar bloqueado. `AgentWorkspace.tsx` mantém draft, missão e eventos somente em `useState`. | Persistir o rascunho no estado compartilhado do preview e manter sua identidade ao abrir avaliação/promoção. Não exige backend. |
| A2 | Alta | Resolver INC-001 no detalhe muda o botão para Resolved, mas `/agentops` → Incidents continua exibindo Open. Rollback e editor de política têm o mesmo padrão de estado local/feedback; salvar política registra auditoria, sem atualizar seu cadastro. | Listagem, detalhe, contadores e auditoria devem consumir o mesmo estado do preview. |
| A3 | Alta | EV-204, EV-198 e EV-181 apontam todos para `/evaluations/it-support`. Deployment de IT Support aparece como v1.8 na lista, mas o detalhe mostra v2.4. Os detalhes são identificados pelo agente, não pela execução/release. | Identificar cada execução, versão e release; transportar essa identidade nos links. Mostrar exatamente o registro clicado. |
| A4 | Alta | Editar versão de um agente e seguir para avaliação não leva o rascunho a um fluxo completo: o editor genérico de suítes mostra Customer Service Agent e começa em v1.3. Há uma jornada funcional de promoção separada da versão editada. | Unificar o percurso editar → avaliar → aprovar → promover, preservando agente e versão, mesmo com dados simulados. |
| A5 | Média | `/knowledge/google-drive` informa Error, Never e nenhum documento, mas a aba Documents mostra três documentos Indexed/Today. Fontes reutilizam a mesma lista e o total “2 agents”. | Usar dados próprios por fonte e estados coerentes de vazio, erro, sincronização e documentos. |
| A6 | Média | `/models` é acessível por Settings → Integrations, mas usa layout anterior, grande espaço vazio e breadcrumb “Workspace”. Run evaluation, Request promotion e Review approvals também abrem componentes de apresentação anterior. Integrations incorpora outro h1 “Settings”. | Harmonizar essas subtelas com o padrão aprovado; preservar a navegação canônica e manter Models contextual, sem adicionar item ao sidebar. |
| A7 | Média | `app/icon.svg` ainda contém o desenho antigo do N. Sidebar/login usam a imagem oficial recém-aprovada. A Issue exige a mesma marca em todos os contextos. | Atualizar o favicon a partir da marca oficial, mantendo a logo aprovada intacta. |
| A8 | Média | Organização, membros, chaves, webhooks, preferências e onboarding usam estado local em `SettingsWorkspace.tsx`; mensagens de salvamento podem sugerir continuidade que não existe após recarregar. | Persistir os estados de demonstração e manter organização/contadores/cabeçalho consistentes. Confirmado por leitura do código; cada formulário não foi individualmente repetido com reload nesta rodada. |
| A9 | Média | FinOps mostra orçamento de $2.800 no topo; Budget planning abre um exemplo com orçamento $300 e gasto $240, independente dos $2.140 da página. Overview usa 24 agentes/26 total e data de 2025; inventário/settings usam outro conjunto. | Consolidar fixtures por workspace. Preservar o layout aprovado da Overview; alinhar valores/datas somente após decisão do produto sobre os dados de demonstração. |
| A10 | Média | SSO existe como entrada, mas a rota de login devolve JSON 503 quando não configurada. “Forgot password?” fornece mensagem; não existe recuperação completa. | Criar apresentação amigável de SSO indisponível/erro/sessão expirada. Recuperação real depende da integração futura com identidade. |

## Telas e subtelas: o que existe

| Área | Cobertura encontrada | Situação |
|---|---|---|
| Overview | Command Center, métricas, atividade, atalhos | Presente; dados de referência independentes |
| Agents | Inventário, pesquisa/filtros, catálogo com 20 templates e 7 categorias, entrada custom | Presente |
| Launch Guide | Use Case, Knowledge, Tools & MCP, Infrastructure, Model, Governance, Evaluate, Deploy e Success | Presente; fluxo automatizado aprovado |
| Agent Detail | Overview, Configuration, Knowledge, Tools, Evaluations, Versions, Activity, AgentOps | Oito abas presentes; continuidade de versões incompleta |
| Knowledge | Inventário, criação/configuração/acesso/revisão, edição, sync/retry, detalhe, Documents e Sync | Presente; duas experiências de detalhe com dados não totalmente compartilhados |
| Tools & MCP | Inventário, configuração, aprovação/escopo/ações, detalhe e teste preview | Presente |
| Models contextual | Cadastro, painel de detalhe, editar, testar, defaults, diálogo de revisão | Presente em `/models`; faltou na auditoria visual anterior |
| Evaluations | Runs, detalhe, suítes, criar/editar suíte, executar, comparar evidência | Presente; identidade de execução e contexto do agente incompletos |
| Deployments | Inventário, ambientes, detalhe/timeline, solicitação de promoção, pausa/retomada/rollback preview | Presente; detalhes precisam respeitar versão/release |
| AgentOps | Health, Incidents, Logs, detalhe de incidente, escalonar/resolver | Presente; estado do incidente não sincronizado |
| FinOps | Custo por agente/modelo, recomendações, exportação, orçamento/alerta/forecast | Presente; editor usa outro conjunto de dados |
| Governance | Policies, Violations, Audit, Policy Editor, fila de aprovação; editor anterior também inclui papéis/classificações | Presente; sobreposição de experiências e estado local |
| Reports | Volume mensal, compliance, desempenho | Presente como dashboard; agendamento não implementado |
| Playground | Conversa de referência e envio simulado | Presente; não executa modelo real |
| Audit Log | Pesquisa, filtros, exportação, eventos do preview | Presente |
| Settings | Organization; Team & Roles (Members/Roles); API & Webhooks (Keys/Webhooks); Integrations; Notifications; Getting Started | Todas as seis abas presentes; persistência e acabamento das subtelas pendentes |
| Header | Pesquisa, notificações, marcar como lidas, ajuda, perfil | Presente; ajuda é um popover curto |
| Login | Email, SSO, mensagem de recuperação, entrada no preview | Visual presente; estados completos de autenticação não entregues |

## Experiências ausentes ou incompletas — não confundir com novas páginas principais

1. **Agendamento de relatórios:** o onboarding oferece “Schedule a weekly report”, mas leva ao dashboard Reports sem configuração de agenda. Implementar um diálogo ou remover essa promessa do checklist mediante decisão de produto.
2. **Detalhe individual de execução/release:** existe detalhe por agente, mas não por registro histórico. É a lacuna A3, não uma necessidade de multiplicar páginas sem propósito.
3. **Erro/404 com identidade NEWNEO:** uma rota inexistente mostra a página 404 padrão. Não foram encontrados `error.tsx`/`not-found.tsx` próprios no app; loading dedicado existe apenas em duas rotas de agentes. Definir estados comuns com voltar/tentar novamente, conforme necessidade.
4. **Estados de autenticação:** SSO indisponível, falha, sessão expirada e retorno à tarefa merecem telas/estados próprios antes da integração.
5. **Ajuda/documentação:** links chamados “Agent design guide”, “Governance playbook” e “API reference” abrem telas operacionais/abas, não conteúdo de documentação. Renomear os links ou fornecer o conteúdo correspondente.

Admin Plane, Business Platform e website são ondas separadas do roadmap e não faltas da entrega Customer AI Platform da Issue #3. Models não precisa virar item de navegação principal.

## Melhorias opcionais para análise

- Confirmar ações de impacto no preview (rollback/revogação) e oferecer nota/motivo quando útil, antes de conectar efeitos reais.
- Dar feedback visível e repetível ao Refresh da Overview: hoje apenas muda uma mensagem para leitor de tela na primeira ativação; não modifica dados.
- Preservar aba/filtros ao voltar de um detalhe. Agent Detail usa apenas estado local para a aba; Settings usa hash, mas troca com replaceState, sem histórico de cada aba.
- Revisar cores por significado nos estados secundários: Required/Recommended/Optional usam todos âmbar no componente genérico, embora nem toda recomendação indique alerta. Não alterar a hierarquia azul/verde aprovada.
- Melhorar detalhes de status com texto explicativo e manter foco/teclado ao abrir e fechar formulários inline. A aprovação axe cobre os estados testados, não toda combinação possível.
- Unificar o vocabulário e a sinalização discreta de demonstração. Algumas subtelas exibem instruções de infraestrutura, duas hierarquias de título ou banners mais densos do que as principais.
- Após definir os componentes finais, avaliar Code Connect: não foram encontrados arquivos de mapeamento no app. É item de handoff de engenharia, não tela ausente.

## Evidência técnica

Principais arquivos: `components/hybrid/AgentWorkspace.tsx`, `Details.tsx`, `SettingsWorkspace.tsx`, `Operations.tsx`, `OverviewFidelity.tsx`, `components/journeys/Models.tsx`, `Evaluations.tsx`, `Deployments.tsx`, `Governance.tsx`, `Operations.tsx`, `components/AccountSettings.tsx`, `app/api/auth/login/route.ts`, `app/icon.svg` (todos em `ai-platform`).

Capturas adicionais locais: `/tmp/newneo-audit-models-1343.png`, `/tmp/newneo-audit-models-390.png`, `/tmp/newneo-audit-evaluations-editor.png`, `/tmp/newneo-audit-deployments-editor.png`, `/tmp/newneo-audit-governance-editor.png`, `/tmp/newneo-audit-finops-editor.png`. Resultados de reprodução: `/tmp/newneo-fine-audit-results.txt` e `/tmp/newneo-subscreen-audit-results.txt`. Log da suíte: `/tmp/newneo-final-audit-tests.log`.

Backend real, AWS, provedores, envio de convites, notificações e execução de agentes permanecem fora desta fase. As prioridades A1–A9 podem ser resolvidas predominantemente no frontend/estado de demonstração.

## Implementação autorizada após a auditoria

Os achados acima registram o estado anterior à correção. A execução e a validação estão documentadas em `FINE_AUDIT_IMPLEMENTATION_2026-09-16.md`. Não interpretar a tabela de achados como a lista atual de pendências.
