# Histórico

## 27/11/2026

Importação de alunos da Retenção (Atualizar Carteira e CSV do Planner).

- A coluna `public.alunos.treinador_id` (uuid) e o índice `alunos_academia_treinador_idx (academia_id, treinador_id)` ficam registrados em `retencao-alunos-treinador.sql`. Já estavam aplicadas no Supabase do Planner (`xpvedihpejivnkssryhc`). Não há chave estrangeira. O SQL pode rodar de novo e pede ao PostgREST para reler o schema.
- Cada gravação de aluno na importação confere o erro. Sucesso só entra na conta quando o banco devolve a linha. A falha mostra o aluno e o motivo (por exemplo PGRST204).
- O nome do treinador na planilha ignora acento, maiúscula e espaço repetido. Não casa pedaço de palavra. Vários treinadores com o mesmo nome pedem escolha na revisão. Sem reconhecimento, o aluno fica com treinador vazio, nunca com o id do gestor. No modo atualizar, treinador vazio não substitui o que já estava gravado.
- Cabeçalhos a mais para a coluna do treinador: professor, instrutor, consultor, consultora, personal, educador, técnico, profissional, orientador, supervisor.
- Atribuir alunos em massa no painel do gestor e no painel admin também confere quantas linhas voltaram gravadas.
