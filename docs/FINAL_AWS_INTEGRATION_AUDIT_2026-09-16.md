# Auditoria final — entrada na integração AWS

Data: 2026-09-16. Código auditado: `7dcfe48`, branch `newneo-ai-platform-v1`.

## Parecer

Pronto para iniciar integração em staging. Não homologado para operação real de clientes. Publicar o frontend na AWS não implementa o runtime, a persistência completa ou a governança de execução.

O inventário das telas principais está coberto pela prévia. Agent Detail possui nove abas, incluindo Skills; a jornada de criação continua com oito etapas. A biblioteca de Skills e o fluxo de quatro etapas estão implementados. Atualização posterior: Create New Skill foi concluído como experiência demonstrável de cinco etapas, com publicação, novas versões e edição/remoção de vínculos em rascunho. Ver ADR-002; a persistência e execução reais continuam pendentes.

## Evidência e limites

- Build aprovado; 54 testes Chromium aprovados; 29 unitários aprovados e um teste PostgreSQL nativo opcional ignorado. Evidência da rodada imediatamente anterior, no mesmo código, registrada em ADR-002; não houve alteração de código nesta auditoria.
- Consulta nova `npm audit --omit=dev`: zero vulnerabilidades conhecidas reportadas. Isso não constitui pentest ou garantia de ausência de falhas.
- Contrato OpenAPI: 46 paths; 583 referências locais verificadas, nenhuma não resolvida. Nenhum path de Skill existe ainda. O contrato é proposto, não implementação de `/api/v1`.
- Inspeção de autenticação OIDC, transações/RLS, rotas, migrations, empacotamento e armazenamento da prévia.
- Não há Docker nem psql disponíveis localmente. Login real, PostgreSQL nativo, Compose/HTTPS, restauração, carga e resultados remotos de CI não foram homologados nesta rodada.
- Não houve acesso à conta AWS, criação de recursos ou nova comparação pixel a pixel com Figma. Testes de UI cobrem os estados definidos, não todas as combinações possíveis.

## Pendências por prioridade

| Prioridade | Achado / evidência | Critério para conclusão |
| --- | --- | --- |
| P0 antes de dados reais | Estado operacional da demo em `components/journeys/PreviewState.tsx` usa sessionStorage; rascunhos locais também usam localStorage. Migrations só cobrem identidade/workspace/agentes/rascunhos. | Persistir recursos reais por tenant; separar demo/live; testar acesso entre organizações e sessões. Nunca importar a demo automaticamente. |
| P0 antes de Skills reais | `lib/skills.ts` e ADR-002 definem composição local. Faltam tabelas/APIs de Skill, SkillVersion, AgentVersion e bindings completos. | Schema e contrato aditivos, versões imutáveis, vínculo a versão específica, concorrência e idempotência no servidor. |
| P0 antes de execução | `lib/preview-server.ts` retorna respostas e avaliações simuladas; `/api/launch/deploy` retorna 503 deliberadamente. | Runtime/worker real com autorização por chamada, limites, timeout, retry seguro, evidência de avaliação e aprovação vinculada ao digest da versão. |
| P0 antes de acesso de clientes | OIDC e RLS têm fundação e testes locais; falta integração autenticada com provedor e banco nativos. Perfis da demo não autorizam ações reais. | Cognito/OIDC, provisionamento de memberships, login/logout e leitura/escrita entre tenants testados no ambiente alvo; decidir revogação/expiração de sessão. |
| P0 antes de armazenar dados de clientes | Backup helper existe, mas não há agendamento/cópia externa/restore verificado. Compose usa uma VM. | Backups criptografados fora da VM, retenção, restauração em ambiente separado e procedimento de recuperação testados. |
| P0 antes de chamadas pagas | FinOps, métricas e governança são demonstrativos; não há limite financeiro de runtime. | Limites de chamadas/tokens/concurrency por workspace, medição de consumo e alertas. Alertas de orçamento sozinhos não bloqueiam gastos. |
| P1 primeiro piloto funcional | Knowledge, Tools/MCP e modelos usam registros/ações de demonstração. | Integrar uma fonte, um modelo e uma ferramenta; credenciais no servidor, escopo mínimo, ingestão segura e testes de falha. |
| P1 antes de operar | Audit, AgentOps e custos ainda incluem snapshots/local state. | Eventos duráveis com ator/tenant/Task/AgentVersion/SkillVersion, logs sanitizados, métricas reais e rastreabilidade de falhas/custos. |
| P1 implantação | Dockerfile/Compose existem; capacidade de 2 GB é hipótese de piloto. | Imagem validada em CI, smoke test, HTTPS, health monitoring, rollback e carga compatível com memória. Construir fora da VM pequena. |
| P2 após piloto | Delivery de notificações/agendas e administração avançada ainda incompletos. Skill Builder e editores de remoção/upgrade foram concluídos posteriormente na demo. | Implementar conforme necessidade do piloto; manter ações não implementadas claramente indisponíveis. |

## Telas e experiência

Cobertura da prévia: Overview; Agents/inventário/catálogo/detalhe; criação de oito etapas; Skills/library/binding/validation/success; Knowledge e detalhes; Tools/MCP e detalhes; Models contextual; Governance/políticas/aprovações; Evaluations; Deployments; AgentOps; FinOps; Reports; Playground; Audit; Settings e login/404/erro.

Não foi identificada outra área principal obrigatória ausente no escopo aprovado. Há telas cuja aparência está pronta, mas cujas ações são simulações (SSO, sincronização, testes de ferramentas, convites, notificações, agendas, avaliações, deploy). A disponibilidade real deve acompanhar o backend, não apenas a presença de um botão.

## Serviços: outra nuvem é obrigatória?

Não. A arquitetura pode operar inteiramente na AWS:

| Necessidade | Direção para o piloto |
| --- | --- |
| Aplicação | Lightsail Linux; Next.js no container existente |
| Banco relacional | PostgreSQL na VM para piloto econômico; serviço gerenciado AWS separado quando orçamento/requisitos justificarem |
| Arquivos e backups | S3, com política de retenção e acesso restrito |
| Identidade | Cognito como provedor OIDC; adaptar e validar a integração existente |
| Modelos | Bedrock para modelos disponíveis na região/conta, mediante habilitação e termos aplicáveis |
| Observabilidade | Logs/métricas AWS e limites de retenção; não enviar dados sensíveis |

Supabase, Vercel, outra nuvem e banco vetorial SaaS não são obrigatórios. Recuperação semântica ainda exige escolher e implementar armazenamento/índice de embeddings, mas isso não obriga contratar um fornecedor externo. O PostgreSQL atual não instala pgvector.

Um modelo ou conector específico fora da AWS poderá exigir conta/API/licença própria. Assinaturas de ferramentas empresariais conectadas continuam independentes. Domínio pode ter cobrança anual. IA é consumo adicional, não está incluída no custo da máquina.

## Orçamento inicial

A tabela pública consultada lista Lightsail Linux com IPv4 e 2 GB por US$12/mês e 4 GB por US$24/mês. Os US$25/mês são um objetivo plausível para infraestrutura pequena de piloto com PostgreSQL na mesma VM, sujeitos à região, armazenamento, backups, tráfego, identidade, impostos e câmbio. Não são garantia de total, nem incluem uso arbitrário de IA.

Separar o banco em Lightsail gerenciado acrescenta pelo menos o plano público de US$15/mês: US$12 + US$15 = US$27, antes dos demais custos. Esse plano de entrada não oferece criptografia de dados em repouso segundo a tabela; não deve ser escolhido automaticamente para dados de clientes. Dimensionamento e configuração serão revistos antes do provisionamento.

Uma VM econômica implica ponto único de falha e administração de PostgreSQL, patches e backups por nossa implantação. É piloto, não alta disponibilidade. Se o teste de carga exigir 4 GB, o plano de US$24 já deixa praticamente nenhuma margem dentro do objetivo de US$25.

Fontes oficiais consultadas em 2026-09-16: [Lightsail](https://aws.amazon.com/lightsail/pricing/), [Cognito](https://aws.amazon.com/cognito/pricing/), [S3](https://aws.amazon.com/s3/pricing/), [Bedrock](https://aws.amazon.com/bedrock/pricing/), [disponibilidade dos modelos](https://docs.aws.amazon.com/en_us/bedrock/latest/userguide/models.html).

## Sequência recomendada

1. Inventariar conta/região, selecionar um piloto e orçamento; criar staging isolado com DNS/HTTPS, identidade, banco e backup.
2. Persistir Agent/Version/Skill/Binding e homologar autorização/isolamento/concorrência.
3. Integrar um modelo, uma fonte e uma ferramenta; executar testes reais com limites de consumo.
4. Ligar avaliação, aprovação e promoção no servidor, telemetria/custos e rollback.
5. Demonstrar restauração, isolamento e operação ponta a ponta antes de liberar clientes.

Decisão final: iniciar integração AWS com escopo de piloto; não habilitar execução de produção apenas por ter publicado as telas.
