-- ============================================================
-- Power Fit · Perfil do colaborador (14/11/2026)
-- Indicadores do ano, ata de 1:1 e teste de perfil ligado ao colaborador.
-- Rodar no Supabase das plataformas (irwvagffrguiljaxrzmd), SQL Editor.
-- Pode rodar mais de uma vez: só cria o que ainda não existe.
-- ============================================================

-- 1. Indicadores do ano (um registro por treinador, ano e mês)
create table if not exists powerfit_treinador_indicadores (
  treinador_id text not null,
  ano int not null,
  mes int not null,
  primary key (treinador_id, ano, mes)
);
alter table powerfit_treinador_indicadores add column if not exists academia_id text;
alter table powerfit_treinador_indicadores add column if not exists carteira numeric;
alter table powerfit_treinador_indicadores add column if not exists exp_realizadas numeric;
alter table powerfit_treinador_indicadores add column if not exists exp_convertidas numeric;
alter table powerfit_treinador_indicadores add column if not exists cons_leads numeric;
alter table powerfit_treinador_indicadores add column if not exists cons_alunos numeric;
alter table powerfit_treinador_indicadores add column if not exists aval_tec numeric;
alter table powerfit_treinador_indicadores add column if not exists a_renovar numeric;
alter table powerfit_treinador_indicadores add column if not exists renovados numeric;
alter table powerfit_treinador_indicadores add column if not exists updated_at bigint;

-- 2. Ata curta de 1:1 (usa a tabela de registros que já existe; os registros antigos continuam valendo)
alter table powerfit_treinador_registros add column if not exists conduzido_por text;
alter table powerfit_treinador_registros add column if not exists acao text;
alter table powerfit_treinador_registros add column if not exists acao_prazo text;
alter table powerfit_treinador_registros add column if not exists acao_status text;
alter table powerfit_treinador_registros add column if not exists combinados jsonb default '[]';
alter table powerfit_treinador_registros add column if not exists medir text;
alter table powerfit_treinador_registros add column if not exists proxima_reuniao text;

-- 3. Teste de perfil ligado ao colaborador (candidatos continuam com pessoa_tipo vazio)
alter table powerfit_pessoas_testes add column if not exists pessoa_tipo text;
alter table powerfit_pessoas_testes add column if not exists pessoa_id text;
alter table powerfit_pessoas_testes add column if not exists liberado boolean default false;
create index if not exists powerfit_pessoas_testes_pessoa_idx on powerfit_pessoas_testes (pessoa_tipo, pessoa_id, created_at desc);

-- 4. Acesso: mesmo padrão das demais tabelas powerfit_
alter table powerfit_treinador_indicadores disable row level security;

-- Atualiza o cache do Supabase para enxergar as colunas novas na hora
notify pgrst, 'reload schema';
