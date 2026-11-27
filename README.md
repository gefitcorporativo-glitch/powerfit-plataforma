# Plataforma Power Fit

Plataforma comercial e de retenção da Power Fit, com Metodologia GeFit.
Montada a partir da matriz `gefitcorporativo-glitch/plataforma` (branch `main`, commit `7ad2958`), igual em funcionamento à Academia Modelo.

- Academia: Power Fit · id `693a66c2-c983-499d-a611-a3225e91ea8f`
- Banco: Supabase da plataforma GeFit (`irwvagffrguiljaxrzmd`), tabelas com prefixo `powerfit_`
- Retenção (`retencao/`): Supabase compartilhado do Planner Digital (`xpvedihpejivnkssryhc`), acessos criados no Painel Admin da Retenção

## Links
- Hub: https://gefitcorporativo-glitch.github.io/powerfit-plataforma/
- NPS do aluno: https://gefitcorporativo-glitch.github.io/powerfit-plataforma/nps.html?a=693a66c2-c983-499d-a611-a3225e91ea8f
- Teste do candidato: https://gefitcorporativo-glitch.github.io/powerfit-plataforma/teste-candidato.html?a=693a66c2-c983-499d-a611-a3225e91ea8f

## Banco
`powerfit-schema-completo.sql` cria todas as tabelas `powerfit_` (pode rodar de novo sem apagar dados).
Os dados do primeiro gestor ficam em branco aqui de propósito: a versão preenchida é entregue à parte, fora do repositório.

## Retenção: aluno e treinador
No Supabase do Planner (`xpvedihpejivnkssryhc`), a tabela `public.alunos` tem a coluna `treinador_id` (uuid, sem chave estrangeira) e o índice `alunos_academia_treinador_idx (academia_id, treinador_id)`. Isso não é a tabela `powerfit_alunos` do outro banco.

O arquivo `retencao-alunos-treinador.sql` repete o que já foi aplicado em 27/11/2026 e pode rodar de novo. No final ele pede ao PostgREST para reler o schema. Sem essa leitura, a tela devolve o erro PGRST204 (coluna invisível para a API) mesmo com a coluna já criada.

## Atualizar Carteira
A tela `retencao/importar_carteira.html` grava cada aluno e só conta sucesso quando o banco confirma a linha. Falha aparece com o nome do aluno e o motivo. A tela não mostra mais "Carteira atualizada!" se nada foi gravado.

O treinador da planilha é comparado sem acento, sem diferença de maiúscula e com espaços juntos. "Ana" não vira "Mariana". Se sobrar mais de um treinador (os dois John, por exemplo), a revisão pede para escolher. Se ninguém for reconhecido, o aluno entra com `treinador_id` vazio. O id de quem está logado, inclusive o do gestor, não é usado no lugar do treinador. No modo "Adicionar e atualizar", uma linha sem treinador reconhecido não apaga o treinador que o aluno já tinha.

Cabeçalhos aceitos para essa coluna: treinador, trainer, responsável, coach, professor, instrutor, consultor, consultora, personal, educador, técnico, profissional, orientador, supervisor.

O CSV curto do Planner (`retencao/sistema_integrado_v3.html`) também confere o erro de cada linha. Quem entra como gestor deixa o aluno sem treinador. Quem entra como treinador recebe a própria carteira. Para distribuir vários treinadores, use Atualizar Carteira.

## Publicação
O site sai do GitHub Pages, branch `main`, pasta raiz: https://gefitcorporativo-glitch.github.io/powerfit-plataforma/
Depois que o merge entra em `main`, o Pages publica sozinho. Não há Netlify nem Vercel neste repositório.

## Fora desta instalação
Tudo do espaço GeFit | Painel Gestão (scripts e cadência do Oliver, `ferramentas-gefit.js`, Biblioteca de Conteúdo, troca de espaços do admin), os hubs antigos da GeFit e as opções de piscina e natação.
