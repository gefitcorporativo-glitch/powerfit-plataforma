'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('./carteira_match.js');

const WILLIAN = { id: 'w1', nome: 'WILLIAN' };
const JOHN = { id: 'j1', nome: 'John' };
const JOHN2 = { id: 'j2', nome: 'JOHN' };
const MARIANA = { id: 'm1', nome: 'Mariana' };
const ANA = { id: 'a1', nome: 'Ana Costa' };
const powerFit = [WILLIAN, JOHN, JOHN2];

function status(nome, lista) {
  return M.resolverTreinador(nome, lista || powerFit);
}

assert.strictEqual(status('WILLIAN').status, 'exato');
assert.strictEqual(status('WILLIAN').id, 'w1');
assert.strictEqual(status('  willian  ').id, 'w1');
assert.strictEqual(status('Wíllian').id, 'w1');
assert.strictEqual(status('Willian\t').id, 'w1');

const doisJohn = status('John');
assert.strictEqual(doisJohn.status, 'ambiguo');
assert.strictEqual(doisJohn.id, null);
assert.strictEqual(doisJohn.candidatos.length, 2);
assert.strictEqual(status('JOHN').status, 'ambiguo');

const anaSozinha = M.resolverTreinador('Ana', [MARIANA]);
assert.strictEqual(anaSozinha.status, 'nao_encontrado');
assert.strictEqual(anaSozinha.id, null);

const anaNoMeio = M.resolverTreinador('Ana', [MARIANA, ANA, WILLIAN]);
assert.strictEqual(anaNoMeio.status, 'unico');
assert.strictEqual(anaNoMeio.id, 'a1', 'Ana casa com Ana Costa se for a única; Mariana fica de fora');
const duasAnas = M.resolverTreinador('Ana', [ANA, { id: 'a2', nome: 'Ana Paula' }]);
assert.strictEqual(duasAnas.status, 'ambiguo');
assert.strictEqual(duasAnas.id, null);

assert.strictEqual(M.resolverTreinador('Ana Costa', [MARIANA, ANA]).id, 'a1');
assert.strictEqual(M.resolverTreinador('ana   costa', [ANA]).id, 'a1');
assert.strictEqual(M.resolverTreinador('João Paulo', [{ id: 'jp', nome: 'Joao Paulo' }]).status, 'exato');

const unicoPrimeiroNome = M.resolverTreinador('Willian Silva', [WILLIAN, JOHN]);
assert.strictEqual(unicoPrimeiroNome.status, 'unico');
assert.strictEqual(unicoPrimeiroNome.id, 'w1');

const silvas = M.resolverTreinador('Silva', [
  { id: 's1', nome: 'Ana Silva' },
  { id: 's2', nome: 'Bruno Silva' }
]);
assert.strictEqual(silvas.status, 'ambiguo');
assert.strictEqual(silvas.id, null);

assert.strictEqual(M.resolverTreinador('', powerFit).status, 'vazio');
assert.strictEqual(M.resolverTreinador('   ', powerFit).id, null);
assert.strictEqual(M.resolverTreinador('Carlos Eduardo', powerFit).status, 'nao_encontrado');

const vazioUp = M.decidirGravacao(M.resolverTreinador('', powerFit), '', 'update');
assert.strictEqual(vazioUp.gravar, false);
const desconhecidoUp = M.decidirGravacao(status('Carlos'), '', 'update');
assert.strictEqual(desconhecidoUp.gravar, false);
const ambiguoUp = M.decidirGravacao(status('John'), '', 'update');
assert.strictEqual(ambiguoUp.gravar, false);
const exatoUp = M.decidirGravacao(status('WILLIAN'), undefined, 'update');
assert.strictEqual(exatoUp.gravar, true);
assert.strictEqual(exatoUp.id, 'w1');
const limpou = M.decidirGravacao(status('WILLIAN'), '', 'update');
assert.strictEqual(limpou.gravar, false, 'escolha explícita de sem treinador não regrava o id antigo');
const escolheu = M.decidirGravacao(status('John'), 'j2', 'update');
assert.strictEqual(escolheu.id, 'j2');
assert.strictEqual(escolheu.origem, 'escolha');

const insertVazio = M.decidirGravacao(M.resolverTreinador('', powerFit), '', 'insert');
assert.strictEqual(insertVazio.gravar, true);
assert.strictEqual(insertVazio.id, null);

const base = { nome: 'Maria', plano: 'mensal', treinador_id: 'nao-usar' };
const semCampo = M.aplicarTreinadorNoPayload(base, desconhecidoUp);
assert.strictEqual(Object.prototype.hasOwnProperty.call(semCampo, 'treinador_id'), false);
assert.strictEqual(semCampo.nome, 'Maria');
const comCampo = M.aplicarTreinadorNoPayload(base, insertVazio);
assert.strictEqual(comCampo.treinador_id, null);
const trocou = M.aplicarTreinadorNoPayload(base, exatoUp);
assert.strictEqual(trocou.treinador_id, 'w1');

assert.strictEqual(
  M.msgErroSupabase({ code: 'PGRST204', message: "Could not find the 'treinador_id' column" }),
  "PGRST204 · Could not find the 'treinador_id' column"
);

const campos = [
  { key: 'nome', keywords: ['nome', 'name', 'aluno', 'cliente', 'member'] },
  { key: 'matricula', keywords: ['matricula', 'matr', 'código', 'codigo', 'code', 'id', 'reg'] },
  { key: 'treinador', keywords: M.TREINADOR_HEADERS }
];
const mapProf = M.autoMapearColunas(['Nome', 'Professor'], campos);
assert.strictEqual(mapProf.nome, 0);
assert.strictEqual(mapProf.treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Aluno', 'Instrutor'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Nome do aluno', 'Consultor'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Nome', 'Responsável'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Nome', 'Técnico'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Nome', 'Consultora'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Nome', 'Personal'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Nome', 'Coach'], campos).treinador, 1);
assert.strictEqual(M.autoMapearColunas(['Código', 'Nome', 'Idade'], campos).matricula, 0);
assert.strictEqual(M.autoMapearColunas(['Nome', 'Idade'], campos).treinador, undefined);

const grupos = M.agruparNomesPlanilha(['WILLIAN', 'willian', 'Ana', ''], powerFit);
assert.strictEqual(grupos.length, 3);
const gWill = grupos.find(g => g.chave === 'willian');
assert.strictEqual(gWill.qtd, 2);
assert.strictEqual(gWill.resolucao.id, 'w1');
const gVazio = grupos.find(g => g.chave === '');
assert.strictEqual(gVazio.resolucao.status, 'vazio');

const dir = __dirname;
const carteira = fs.readFileSync(path.join(dir, 'importar_carteira.html'), 'utf8');
assert.ok(carteira.includes('carteira_match.js'), 'a tela precisa carregar a lógica testada');
assert.ok(!carteira.includes('alvo.includes'), 'o match frouxo antigo não pode voltar');
assert.ok(!carteira.includes('resolverTreinadorId'), 'não existe mais fallback para o id de quem logou');
assert.ok(carteira.includes('TREINADOR_HEADERS'));
assert.ok(carteira.includes('revisaoTreinadores'));
assert.ok(carteira.includes('successFalhas'));

const sistema = fs.readFileSync(path.join(dir, 'sistema_integrado_v3.html'), 'utf8');
assert.ok(sistema.includes('carteira_match.js'));
assert.ok(sistema.includes('csvResultado'));
const ini = sistema.indexOf('async function importarCSV');
const fim = sistema.indexOf('async function salvarNovaExp');
assert.ok(ini > 0 && fim > ini);
const corpoCsv = sistema.slice(ini, fim);
assert.ok(corpoCsv.includes('falhas.push'), 'o CSV simples precisa registrar falha por linha');
assert.ok(corpoCsv.includes('erroSupabase'));
assert.ok(!corpoCsv.includes("showToast(`✅ ${csvDados.length} alunos importados!`)"));
const ajudaErro = sistema.slice(sistema.indexOf('function erroSupabase'), sistema.indexOf('async function importarCSV'));
assert.ok(ajudaErro.includes('msgErroSupabase'));

const conv = sistema.slice(sistema.indexOf('async function converterExp'), sistema.indexOf('async function naoConverterExp'));
assert.ok(conv.includes('errAluno'));
assert.ok(conv.includes('erroSupabase'));

console.log('carteira_match.test.js: ok');
