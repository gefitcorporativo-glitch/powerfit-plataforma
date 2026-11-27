/* Lógica pura da importação de carteira.
   Usada pela tela Atualizar Carteira e coberta por carteira_match.test.js.
   Não acessa rede, DOM nem chave nenhuma. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CarteiraMatch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizarNome(valor) {
    return String(valor == null ? '' : valor)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokens(valor) {
    var n = normalizarNome(valor);
    return n ? n.split(' ') : [];
  }

  function tokensContidos(menor, maior) {
    if (!menor.length || menor.length > maior.length) return false;
    var resto = maior.slice();
    for (var i = 0; i < menor.length; i++) {
      var pos = resto.indexOf(menor[i]);
      if (pos < 0) return false;
      resto.splice(pos, 1);
    }
    return true;
  }

  function resumo(t) {
    return { id: t.id, nome: t.nome };
  }

  /* exato: nome igual, sem acento, caixa ou espaço duplicado.
     unico: um só treinador contém o outro por palavra inteira
     (Willian Silva casa com WILLIAN se for o único).
     Não usa includes de pedaço: Ana não casa com Mariana.
     Vários com o mesmo nome (John e JOHN) ficam ambiguos. */
  function resolverTreinador(nomeCsv, treinadores) {
    var lista = (treinadores || []).filter(function (t) {
      return t && t.id && normalizarNome(t.nome);
    });
    var bruto = String(nomeCsv == null ? '' : nomeCsv).trim();
    if (!bruto) {
      return { status: 'vazio', id: null, nome: null, candidatos: [], nomeCsv: '' };
    }
    var norm = normalizarNome(bruto);
    var toks = tokens(bruto);
    var exatos = lista.filter(function (t) { return normalizarNome(t.nome) === norm; });
    if (exatos.length === 1) {
      return { status: 'exato', id: exatos[0].id, nome: exatos[0].nome, candidatos: exatos.map(resumo), nomeCsv: bruto };
    }
    if (exatos.length > 1) {
      return { status: 'ambiguo', id: null, nome: null, candidatos: exatos.map(resumo), nomeCsv: bruto };
    }
    var porToken = lista.filter(function (t) {
      var tt = tokens(t.nome);
      return tokensContidos(tt, toks) || tokensContidos(toks, tt);
    });
    if (porToken.length === 1) {
      return { status: 'unico', id: porToken[0].id, nome: porToken[0].nome, candidatos: porToken.map(resumo), nomeCsv: bruto };
    }
    if (porToken.length > 1) {
      return { status: 'ambiguo', id: null, nome: null, candidatos: porToken.map(resumo), nomeCsv: bruto };
    }
    return { status: 'nao_encontrado', id: null, nome: null, candidatos: [], nomeCsv: bruto };
  }

  var TREINADOR_HEADERS = [
    'treinador', 'trainer', 'responsavel', 'responsável', 'coach',
    'professor', 'instrutor', 'instructor', 'consultor', 'consultora',
    'personal', 'educador', 'tecnico', 'técnico', 'profissional',
    'orientador', 'supervisor', 'teacher'
  ];

  /* Cabeçalho: acento e caixa não importam. A palavra-chave precisa
     aparecer no texto já normalizado (o mesmo critério de antes). */
  function autoMapearColunas(headers, campos) {
    var mapeamento = {};
    (campos || []).forEach(function (campo) {
      var kws = (campo.keywords || []).map(normalizarNome).filter(Boolean);
      (headers || []).forEach(function (h, i) {
        if (mapeamento[campo.key] !== undefined) return;
        var hl = normalizarNome(h);
        if (!hl) return;
        if (kws.some(function (k) { return hl.indexOf(k) !== -1; })) mapeamento[campo.key] = i;
      });
    });
    return mapeamento;
  }

  /* escolha undefined: usa o reconhecimento automático.
     escolha '': a pessoa escolheu "sem treinador".
     escolha id: a pessoa escolheu aquele treinador.
     No update, sem id reconhecido o campo nem vai no payload
     (não apaga o treinador que já está no aluno).
     No insert, grava o id ou null. Nunca usa o id de quem está logado. */
  function decidirGravacao(resolucao, escolha, modo) {
    var id = null;
    var origem = (resolucao && resolucao.status) || 'vazio';
    if (escolha) {
      id = String(escolha);
      origem = 'escolha';
    } else if (escolha === undefined && resolucao && resolucao.id) {
      id = resolucao.id;
      origem = resolucao.status;
    }
    if (modo === 'update') return { id: id, gravar: !!id, origem: origem };
    return { id: id || null, gravar: true, origem: origem };
  }

  function aplicarTreinadorNoPayload(payload, decisao) {
    var out = {};
    Object.keys(payload || {}).forEach(function (k) {
      if (k !== 'treinador_id') out[k] = payload[k];
    });
    if (decisao && decisao.gravar) out.treinador_id = decisao.id;
    return out;
  }

  function msgErroSupabase(error) {
    if (!error) return 'erro desconhecido';
    if (typeof error === 'string') return error;
    var partes = [];
    if (error.code) partes.push(String(error.code));
    if (error.message) partes.push(String(error.message));
    else if (error.details) partes.push(String(error.details));
    if (error.hint && partes.indexOf(String(error.hint)) === -1) partes.push(String(error.hint));
    return partes.filter(Boolean).join(' · ') || 'erro desconhecido';
  }

  function agruparNomesPlanilha(nomes, treinadores) {
    var grupos = [];
    var idx = Object.create(null);
    (nomes || []).forEach(function (nome) {
      var rotulo = String(nome == null ? '' : nome).trim();
      var chave = normalizarNome(rotulo);
      if (!idx[chave]) {
        idx[chave] = {
          chave: chave,
          rotulo: rotulo || '(sem treinador na planilha)',
          qtd: 0,
          resolucao: resolverTreinador(rotulo, treinadores)
        };
        grupos.push(idx[chave]);
      }
      idx[chave].qtd++;
    });
    return grupos;
  }

  return {
    normalizarNome: normalizarNome,
    resolverTreinador: resolverTreinador,
    autoMapearColunas: autoMapearColunas,
    decidirGravacao: decidirGravacao,
    aplicarTreinadorNoPayload: aplicarTreinadorNoPayload,
    msgErroSupabase: msgErroSupabase,
    agruparNomesPlanilha: agruparNomesPlanilha,
    TREINADOR_HEADERS: TREINADOR_HEADERS
  };
});
