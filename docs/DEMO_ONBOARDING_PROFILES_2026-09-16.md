# Primeira utilização, perfis e demonstração reproduzível

16/09/2026 · itens 3, 4 e 5 autorizados · frontend sem novas integrações.

## Entrada e orientação

O botão **Demo** no cabeçalho abre os controles, sem adicionar seções ao sidebar ou mudar a jornada de oito etapas. **Show getting started** apresenta quatro momentos de orientação: escolher um template, configurar/avaliar, revisar/publicar e acompanhar. Esses momentos explicam a jornada existente; não substituem suas oito etapas. O progresso usa agentes, avaliações, releases e tarefas simuladas da sessão. É possível dispensar e reabrir a orientação.

**Start empty workspace** inicia a experiência sem agentes de referência, fontes conectadas, endpoints, avaliações ou releases. Agents orienta a criação do primeiro agente; Knowledge permite adicionar a primeira fonte. Dashboards históricos mostram um estado vazio, sem atribuir aos agentes novos os gráficos históricos dos exemplos. O catálogo continua disponível como biblioteca de templates.

## Perfis simulados

| Perfil | Ações disponíveis na demonstração |
| --- | --- |
| Administrator | Configurar workspace, criar, avaliar, aprovar e operar. |
| Creator | Configurar agentes, fontes e endpoints, avaliar versões e solicitar promoção. |
| Approver | Inspecionar e aprovar/rejeitar a fila de revisão. |
| Operator | Acompanhar, executar tarefas/testes simulados, sincronizar uma fonte existente, pausar/retomar/rollback e administrar agendas de relatórios. |

As demais telas permanecem navegáveis; formulários e ações fora do perfil são desabilitados ou explicados. O perfil escolhido persiste ao recarregar a aba. Creator usa Staging no Launch Guide e solicita a promoção revisada em Deployments; não pode usar a aprovação direta de Production do Administrator. Approver revisa a fila em Governance.

**Limite deliberado:** trata-se de uma simulação de apresentação/interação. Não é RBAC de produção, não altera a identidade autenticada e não constitui barreira de segurança do backend. Controles Demo são metacontroles de apresentação, disponíveis para trocar perfil e restaurar a demonstração independentemente do perfil atual.

## Restauração

Start empty workspace e Restore sample workspace sempre pedem confirmação, descrevendo o descarte de alterações simuladas. Cancelar não altera dados. Confirmar substitui o estado operacional da demonstração e remove somente as chaves conhecidas de rascunhos Launch Guide e gerenciadores de recursos. Não usa `localStorage.clear()`/`sessionStorage.clear()`; autenticação, cookies, dados não relacionados e a preferência de sidebar são preservados. O perfil de demonstração atual permanece selecionado.

Restore sample workspace repõe os fixtures originais, remove os agentes/releases criados, filtros e preferências da simulação e restaura as notificações de exemplo. O workspace vazio não exibe notificações históricas de exemplo. Falha de acesso ao armazenamento gera mensagem, sem alegar que os rascunhos armazenados foram removidos.

## Verificação

- Build de produção e TypeScript.
- Suíte de navegador com 48 casos, incluindo quatro novos testes de primeira utilização, cancelamento/reset, persistência do vazio, restauração seletiva e capacidades dos perfis.
- Acessibilidade automatizada dos controles e da orientação em 1440 e 390px; matriz existente preservada para outras telas.
- Inspeção da captura mobile da orientação; sidebar, marca e composição principal da Overview preservados.
- Regressões adicionais de notificações e agenda após os últimos ajustes de perfil.

Nenhum convite, pagamento, envio de relatório, execução de modelo ou integração real é disparado.
