-- ============================================================
-- Área do Treinador · treinador do aluno (27/11/2026)
-- Rodar no Supabase do APP PLANNER (xpvedihpejivnkssryhc), SQL Editor.
-- NÃO é o Supabase das plataformas (aquele usa powerfit_alunos).
-- Pode rodar de novo: não apaga dado e não cria chave estrangeira.
-- A coluna e o índice já foram aplicados em 27/11/2026.
-- O notify só pede ao PostgREST para reler o schema (evita PGRST204).
-- ============================================================
alter table public.alunos add column if not exists treinador_id uuid;

create index if not exists alunos_academia_treinador_idx
  on public.alunos (academia_id, treinador_id);

notify pgrst, 'reload schema';
