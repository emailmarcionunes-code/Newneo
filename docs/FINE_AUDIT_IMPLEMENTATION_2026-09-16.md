# Fechamento da auditoria fina — frontend NEWNEO

16/09/2026 · branch `newneo-ai-platform-v1` · escopo: experiência navegável de demonstração.

A autorização “a lista de ajustes pode avançar” cobre as correções identificadas na auditoria. O layout aprovado, os grupos de navegação, a jornada de oito etapas e a logo oficial permanecem como referência. Os valores demonstrativos foram alinhados ao inventário compartilhado.

## Correções

| Item | Resultado |
| --- | --- |
| A1 | Rascunho, missão, modelo, responsável, aba e atividade persistem na sessão da aba. IT Support parte da versão real do fixture, v1.8, e cria v1.9. |
| A2 | Incidentes, rollback, nomes/descrições/modos de políticas e contadores consultam estado compartilhado. Resolver um incidente atualiza sua listagem; rollback atualiza o release correspondente. |
| A3 | Links de avaliações e deployments identificam o registro com `run` ou `release`. O detalhe mostra versão, agente e resultado do registro selecionado; IDs inexistentes mostram 404. |
| A4 | Rascunho → avaliação → pedido → aprovação → Production preserva agente/versão. Alterar a configuração invalida a elegibilidade da avaliação anterior. Aprovar uma versão não substitui a versão de outro agente. |
| A5 | Fontes têm documentos e agentes vinculados próprios. Fonte sem sincronização/erro não apresenta documentos indexados. Alterações no gerenciador se refletem no inventário. |
| A6 | Models e editores operacionais compartilham tipografia, painéis e espaçamentos; Models mantém acesso contextual e breadcrumb próprio. Integrations não contém outro h1 Settings. |
| A7 | Favicon usa o N recortado por viewport SVG da imagem oficial, sem redesenhar a marca. Sidebar e login mantêm os assets aprovados. |
| A8 | Organização, equipe, chaves fictícias, webhooks, notificações e onboarding persistem na aba. Nome da organização é compartilhado com o cabeçalho/sidebar. |
| A9 | Overview e FinOps usam o inventário de agentes para totais de gasto/tarefas. Planejamento e resumo compartilham orçamento; Overview usa contexto de preview sem data antiga. |
| A10 | SSO não configurado e callback malsucedido levam a estados legíveis no login. Existe mensagem de sessão expirada. Recuperação real de senha continua sob responsabilidade do futuro provedor de identidade. |

## Experiências de apoio

- Agendamento semanal de Reports com dia, horário e destinatário; salvar, editar, cancelar e pausar funcionam no preview. Nenhuma mensagem é enviada.
- Páginas NEWNEO para 404 e erro recuperável, com retorno à Overview/tentar novamente. Os estados de carregamento existentes foram preservados; não há novo shell temporário que anime ou duplique o sidebar.
- Links de ajuda renomeados de acordo com o destino real.
- Refresh da Overview produz feedback visível a cada ativação.
- Confirmação antes de rollback e revogação de chave fictícia.
- Filtros de inventário e aba do agente persistentes; histórico de abas de Settings acompanha voltar/avançar do navegador.
- Required/Recommended/Optional deixam de compartilhar indevidamente a cor de alerta.

## Cobertura e limites

Overview, Agents, Catalog, Launch Guide (8 etapas), Agent Detail (8 abas), Knowledge, Tools & MCP, Governance, Evaluations, Deployments, AgentOps, FinOps, Reports, Playground, Audit Log, Settings e Models contextual têm destinos navegáveis. Detalhes, editores e estados de apoio foram incluídos na revisão. Não foi identificada outra página principal faltante do Customer AI Platform; Admin Plane, Business Platform e website pertencem a ondas separadas.

A persistência é `sessionStorage`: sobrevive à navegação/reload da aba, não é armazenamento de produção nem sincronização entre usuários. Métricas, traces e resultados são dados demonstrativos; avaliações não executam modelos. Agendamentos, chaves e aprovações não produzem efeitos externos.

Code Connect permanece uma etapa de handoff da biblioteca Figma, não uma tela ou bloqueio de navegação. Nenhum mapeamento foi inventado sem IDs de componentes de biblioteca validados. Autenticação operacional, provedores, entrega de relatórios, sincronização externa e infraestrutura são a próxima fase de integração.

## Validação

- Build de produção e checagem TypeScript.
- Testes unitários: 23 aprovados; 1 teste opcional de PostgreSQL nativo não executado, pois não há banco de teste configurado.
- Navegador: suíte de 41 casos, incluindo oito novos casos de regressão da auditoria; acessibilidade automatizada e responsividade em 390, 768, 1180, 1343 e 1440px conforme a matriz de cada tela.
- Regressões específicas: persistência do rascunho e Settings; identidade da avaliação/release; documento indisponível; aprovação bloqueada após alteração; promoção de IT Support até Production; cancelamento de agenda; SSO indisponível; favicon; sidebar recolhido estático durante navegação.
- Inspeção visual de Models e editor de avaliações em desktop/mobile. A verificação de acessibilidade cobre os estados testados, não constitui certificação de todas as combinações possíveis.
