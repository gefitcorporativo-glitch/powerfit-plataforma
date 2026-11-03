# Briefing: criar a plataforma GeFit da Power Fit

**Para:** sessão do Claude Code na nuvem · **De:** conversa NR | RG CAVE (03/11/2026) · **Dono:** Nelson Rabelo (GeFit)

## Objetivo
Montar neste repositório (`gefitcorporativo-glitch/powerfit-plataforma`) a plataforma completa da **Power Fit**, igual em funcionamento à **matriz GeFit (Academia Modelo)**, mudando só a identidade e os dados do cliente.

## Regras de trabalho (obrigatórias)
1. **Antes de construir, mostre o plano e espere a confirmação do Nelson.** Ao terminar, mostre o que ficou (prints) e só publique com o "pode publicar".
2. **A matriz é a fonte da verdade.** Sempre baixar fresco de `github.com/gefitcorporativo-glitch/plataforma`, branch `main` (repositório público: `git clone --depth 1 https://github.com/gefitcorporativo-glitch/plataforma` ou `raw.githubusercontent.com/gefitcorporativo-glitch/plataforma/main/<arquivo>`). Não usar cópias de outras academias.
3. **Não levar nada do espaço "GeFit | Painel Gestão"** (scripts do Oliver, `ferramentas-gefit.js`, cadência da GeFit, Biblioteca de Conteúdo `conteudo.html`, troca de espaços do admin). Isso é da empresa GeFit, não vai para cliente.
4. **Não mexer** nos repositórios da RG Cave, da Eagler nem da matriz.
5. Português do Brasil, sem travessões. Na troca de nome, não substituir pedaços de palavras (erro antigo: "clicavel" virou "clieaglerl" numa réplica). Trocar só nomes inteiros e prefixos de tabela.
6. Segurança: **nunca** colocar chave secreta (`service_role` / `sb_secret_`) em arquivo nenhum e nunca desligar o RLS da Retenção.

## Dados da Power Fit
| Item | Valor |
|---|---|
| Nome | Power Fit (nome curto nas telas: "Power Fit") |
| ID da academia (novo) | `693a66c2-c983-499d-a611-a3225e91ea8f` |
| Prefixo das tabelas | `powerfit_` |
| Banco | Supabase da plataforma GeFit, projeto `irwvagffrguiljaxrzmd` (o mesmo da matriz, da Cave e da Eagler). URL e chave pública: copiar do `config.js` / arquivos da matriz |
| Logo | `logo-powerfit.png` (raiz deste repositório): emblema dourado com "POWERFIT" cromado, fundo transparente. Fica bem sobre fundo escuro |
| Cores | Destaque dourado `#E6A92B`; dourado escuro para texto sobre fundo claro `#9C6A12`; dourado claro `#FFD978`; menus e topo pretos `#111`; fundo claro `#F7F4EC`. Botões dourados com texto escuro `#111` |
| Modalidades | Academia de musculação: **sem opções de piscina/natação/hidro** |
| Rodapé | "Metodologia GeFit" discreto, como nas outras réplicas |
| Primeiro login (gestor) | **Perguntar ao Nelson** o nome, o e-mail e a senha do primeiro gestor |

## O que a matriz tem hoje (contexto do Nelson, 03/11/2026)
- `ferramentas-academia.js`: Biblioteca de scripts da academia (opção 1 e opção 2 por tentativa, objeções, rotina, perfis). Configurada por `window.ACADEMIA_CFG` (nome, presente, cor, corT, corTexto, escuro, fundo) no topo do `index.html` e do `campanhas.html`. Na réplica, trocar pelos valores da Power Fit.
- `campanhas.html`: botão 📚 Scripts no Kanban e cadência do card com opção 1 e 2 (10 contatos em leads). O espaço GeFit | Painel Gestão mantém cadência própria e não vai para clientes.
- `pessoas.html` + `teste-candidato.html`: Hub de Pessoas (teste de perfil do candidato e painel do gestor). Tabela `pessoas_testes`, academia por `?a=<academia_id>`.
- `nps.html`: pesquisa do aluno. Tabela `nps_respostas`, academia por `?a=<academia_id>`; na réplica, o id padrão vira o da Power Fit.
- Menu ☰ Ferramentas do `index.html`: Universidade Corporativa (antiga Central de Scripts), Biblioteca de scripts, Hub de Pessoas, Copiar link do NPS.
- `central-leads.html` + `captura.html`: Central de Leads (links de captação com QR, indicação digital com código, convite, ranking, sorteio, artes, ocultar leads). Na réplica, `P='powerfit_'` e `ACADEMIA_PADRAO` = id da Power Fit.
- SQLs da matriz: `schema-central-leads.sql` e `schema-pessoas-nps.sql` (gerar as versões com prefixo `powerfit_`).

## Módulo Retenção (Planner Digital / Área do Treinador)
- Pasta `retencao/` no repositório da matriz; o item "🏋️ Área do Treinador" do menu lateral (grupo Retenção) abre os módulos. Copiar a pasta inteira.
- Usa **outro** Supabase, compartilhado entre academias ("Sistema+App Planner Digital", `xpvedihpejivnkssryhc`), com login pelo Supabase Auth. Config em `retencao/config.js` (chave publishable, pública).
- **Não se cria banco novo de Retenção.** O Nelson cria a academia e os logins (gestor e treinadores) pelo Painel Admin da Retenção (`retencao/admin_painel.html`). Avisar o Nelson desse passo no final.
- Login único: ao entrar na plataforma, a sessão da Retenção abre com o mesmo e-mail e senha.

## Passo a passo
1. Clonar a matriz e listar os arquivos que vão para o cliente (tudo do item acima; nada do Painel Gestão).
2. Mostrar ao Nelson o plano: arquivos, troca de identidade, prefixo, id, o que fica de fora. Perguntar o primeiro login. **Esperar confirmação.**
3. Gerar os arquivos da Power Fit: `MODO_MESTRE=false`, `ACADEMIA_ID`/`ACADEMIA_PADRAO` = `693a66c2-c983-499d-a611-a3225e91ea8f`, prefixo `powerfit_` em todas as tabelas, `ACADEMIA_CFG` com as cores acima, logo da Power Fit no lugar do logo da matriz em todas as páginas (inclusive as imagens embutidas em base64), nomes "Academia Modelo"/"GeFit" de academia trocados por "Power Fit" (sem trocar a assinatura "Metodologia GeFit").
4. Gerar **um SQL único** `powerfit-schema-completo.sql` para o Nelson rodar no Supabase (SQL Editor, "Run without RLS" como nos demais): todas as tabelas `powerfit_` que os arquivos usam (conferir com um grep de `powerfit_` em todos os arquivos), a academia `693a66c2-…` em `powerfit_academias`, o primeiro gestor, Central de Leads (incluindo indicação, artes e ocultar), Hub de Pessoas e NPS. Tudo com `if not exists` (pode rodar de novo sem apagar dados). Testar o SQL num Postgres local antes.
5. Testar no navegador (Playwright com o Supabase simulado): login, Hub, Kanban com 📚 Scripts, Central de Leads (cadastro com código, convite, ranking, sorteio), Hub de Pessoas, NPS. Mostrar prints.
6. Publicar com aprovação. Depois pedir ao Nelson para ativar o site em **Settings → Pages → Branch: main → Save** e para criar a academia e os logins no Painel Admin da Retenção.
7. Ao final, entregar a lista do que fazer: rodar o SQL, ativar o Pages, criar os acessos da Retenção, links do Hub (`https://gefitcorporativo-glitch.github.io/powerfit-plataforma/`) e do NPS.

## Pendente conhecido (não bloqueia)
O login da plataforma (tabela `gestores`, coluna `senha_hash`) compara senha sem criptografia usando a chave pública. Vai junto em toda réplica até ser refeito com Supabase Auth.
