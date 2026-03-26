// src/utils/relatorioEngine.js  — Motor de métricas hardened para produção
// Versão: 2.0 — zero crashes em qualquer estado de dados
import { PIPELINE_STAGES, TZ_BR } from './constants';

// ─── helpers seguros ─────────────────────────────────────────────────────────

/** Nunca lança exceção. Retorna Date válida ou null. */
function parseDate(val) {
  if (!val) return null;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

/** Divisão segura — nunca retorna NaN/Infinity */
function pct(num, den) {
  if (!den || den === 0 || isNaN(num) || isNaN(den)) return 0;
  return Math.round((num / den) * 100);
}

/** Início de uma semana (domingo) a N semanas atrás — com fallback */
function inicioSemana(n = 0) {
  try {
    const br = new Date(new Date().toLocaleString('en-US', { timeZone: TZ_BR }));
    br.setDate(br.getDate() - br.getDay() - n * 7);
    br.setHours(0, 0, 0, 0);
    return br;
  } catch {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() - n * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

/** Fim de uma semana (sábado) a N semanas atrás */
function fimSemana(n = 0) {
  const f = new Date(inicioSemana(n));
  f.setDate(f.getDate() + 6);
  f.setHours(23, 59, 59, 999);
  return f;
}

/** Filtra registros por intervalo — ignora entradas sem data */
function filtrarPorPeriodo(registros, inicio, fim) {
  return registros.filter(r => {
    const d = parseDate(r?.data_cadastro);
    return d && d >= inicio && d <= fim;
  });
}

/** Agrupa e conta — ignora null/undefined */
function agrupar(arr, key) {
  return arr.reduce((acc, r) => {
    if (!r) return acc;
    const raw = typeof key === 'function' ? key(r) : r[key];
    const k = (raw != null && raw !== '') ? String(raw) : 'Outros';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

/** Sanitiza array de registros — remove nulos e garante campos mínimos */
function sanitizar(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(r => r && typeof r === 'object').map(r => ({
    id:            r.id            ?? '',
    nome:          r.nome          ?? '',
    status:        r.status        ?? 'novo',
    origem:        r.origem        ?? 'Outros',
    data_cadastro: r.data_cadastro ?? null,
    observacoes:   r.observacoes   ?? '',
  }));
}

// ─── evolução diária ──────────────────────────────────────────────────────────
function evolucaoDiaria(registros, dias = 14) {
  const resultado = [];
  for (let i = dias - 1; i >= 0; i--) {
    try {
      const d = new Date(new Date().toLocaleString('en-US', { timeZone: TZ_BR }));
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA', { timeZone: TZ_BR });
      const label   = d.toLocaleDateString('pt-BR', { timeZone: TZ_BR, day: '2-digit', month: '2-digit' });
      const total   = registros.filter(r => {
        const dc = r.data_cadastro;
        return dc && typeof dc === 'string' && dc.startsWith(dateStr);
      }).length;
      resultado.push({ date: dateStr, label, total });
    } catch {
      resultado.push({ date: '', label: '??', total: 0 });
    }
  }
  return resultado;
}

// ─── funil ────────────────────────────────────────────────────────────────────
function calcularFunil(registros) {
  const total = registros.length || 1;
  const grupos = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.id] = registros.filter(r => (r.status || 'novo') === s.id).length;
    return acc;
  }, {});

  return PIPELINE_STAGES.map((stage, i) => {
    const count = grupos[stage.id] || 0;
    const prev  = i === 0 ? total : (grupos[PIPELINE_STAGES[i - 1].id] || 1);
    return {
      ...stage,
      count,
      pct:      pct(count, total),
      conversao: pct(count, prev),
    };
  });
}

// ─── gargalo ──────────────────────────────────────────────────────────────────
function detectarGargalo(funil) {
  const ativos = funil.filter(f =>
    f.count > 0 && !['aprovado', 'recusado', 'sem_interesse'].includes(f.id)
  );
  if (!ativos.length) return null;
  return ativos.reduce((max, f) => f.count > max.count ? f : max, ativos[0]);
}

// ─── origem eficiente ─────────────────────────────────────────────────────────
function origemEficiente(registros) {
  const origens = [...new Set(registros.map(r => r.origem).filter(Boolean))];
  const stats = origens.map(o => {
    const grupo     = registros.filter(r => r.origem === o);
    const aprovados = grupo.filter(r => r.status === 'aprovado').length;
    return { origem: o, total: grupo.length, aprovados, taxa: pct(aprovados, grupo.length) };
  }).filter(s => s.total >= 1);
  if (!stats.length) return null;
  return [...stats].sort((a, b) => b.taxa - a.taxa)[0];
}

// ─── insights ─────────────────────────────────────────────────────────────────
function gerarInsights({ totalGeral, semanaAtual, semanaAnterior, crescimentoPct, funil, gargalo, eficiente, porOrigem, porStatus }) {
  const insights = [];
  if (totalGeral === 0) {
    insights.push({ tipo:'info', icon:'📭', texto:'Nenhum candidato cadastrado ainda. Adicione candidatos para gerar insights automáticos.' });
    return insights;
  }

  // Crescimento semanal
  if (semanaAnterior > 0) {
    if (crescimentoPct > 0)
      insights.push({ tipo:'positivo', icon:'📈', texto:`Crescimento de ${crescimentoPct}% em relação à semana anterior (${semanaAtual} vs ${semanaAnterior} cadastros).` });
    else if (crescimentoPct < 0)
      insights.push({ tipo:'negativo', icon:'📉', texto:`Queda de ${Math.abs(crescimentoPct)}% em relação à semana anterior (${semanaAtual} vs ${semanaAnterior} cadastros).` });
    else
      insights.push({ tipo:'neutro', icon:'➡️', texto:`Volume estável em relação à semana anterior — ${semanaAtual} cadastros.` });
  } else if (semanaAtual > 0) {
    insights.push({ tipo:'info', icon:'🆕', texto:`${semanaAtual} candidatos cadastrados nesta semana. Dados insuficientes para comparação histórica.` });
  }

  // Gargalo
  if (gargalo?.count > 0) {
    const p = pct(gargalo.count, totalGeral);
    insights.push({
      tipo: p > 30 ? 'alerta' : 'neutro', icon: p > 30 ? '⚠️' : '📌',
      texto: `A etapa "${gargalo.label}" concentra ${p}% dos candidatos ativos (${gargalo.count}). ${p > 30 ? 'Recomenda-se atenção imediata.' : ''}`.trim(),
    });
  }

  // Origem eficiente
  if (eficiente?.aprovados > 0)
    insights.push({ tipo:'positivo', icon:'🎯', texto:`"${eficiente.origem}" é o canal mais eficiente: ${eficiente.taxa}% de aprovação (${eficiente.aprovados} de ${eficiente.total}).` });

  // Top origem por volume
  const topOrigem = Object.entries(porOrigem).sort((a,b) => b[1]-a[1])[0];
  if (topOrigem?.[1] > 1) {
    const p = pct(topOrigem[1], totalGeral);
    insights.push({ tipo:'info', icon:'🔍', texto:`"${topOrigem[0]}" lidera em volume: ${p}% do total (${topOrigem[1]} candidatos).` });
  }

  // Taxa de aprovação
  const aprovados = porStatus['aprovado'] || 0;
  const taxa = pct(aprovados, totalGeral);
  insights.push({
    tipo: taxa > 15 ? 'positivo' : taxa > 5 ? 'neutro' : 'alerta', icon:'✅',
    texto: `Taxa de aprovação geral: ${taxa}% (${aprovados} de ${totalGeral}). ${taxa < 5 && totalGeral > 5 ? 'Considere revisar os critérios de triagem.' : ''}`.trim(),
  });

  return insights.slice(0, 5);
}

// ─── export principal ─────────────────────────────────────────────────────────
export function calcularRelatorio(rawRegistros) {
  // Nunca lança — sempre retorna um objeto válido
  try {
    const registros = sanitizar(rawRegistros);
    const agora     = new Date();

    const is0 = inicioSemana(0), fs0 = fimSemana(0);
    const is1 = inicioSemana(1), fs1 = fimSemana(1);

    const semAtual    = filtrarPorPeriodo(registros, is0, fs0);
    const semAnterior = filtrarPorPeriodo(registros, is1, fs1);

    const semanaAtual    = semAtual.length;
    const semanaAnterior = semAnterior.length;
    const crescimentoPct = semanaAnterior > 0
      ? Math.round(((semanaAtual - semanaAnterior) / semanaAnterior) * 100)
      : 0;

    const porStatus = agrupar(registros, 'status');
    const porOrigem = agrupar(registros, 'origem');
    const funil     = calcularFunil(registros);
    const gargalo   = detectarGargalo(funil);
    const eficiente = origemEficiente(registros);
    const evolucao  = evolucaoDiaria(registros, 14);

    const pizzaOrigem = Object.entries(porOrigem)
      .sort((a,b) => b[1]-a[1]).slice(0,8)
      .map(([name, value]) => ({ name, value: value || 0 }));

    const barrasEtapas = PIPELINE_STAGES.map(s => ({
      name:  s.label,
      total: registros.filter(r => (r.status || 'novo') === s.id).length,
      fill:  s.color,
    }));

    const comparativo = Array.from({ length: 7 }, (_, i) => {
      try {
        const dA = new Date(is0); dA.setDate(dA.getDate() + i);
        const dB = new Date(is1); dB.setDate(dB.getDate() + i);
        const sA = dA.toLocaleDateString('en-CA', { timeZone: TZ_BR });
        const sB = dB.toLocaleDateString('en-CA', { timeZone: TZ_BR });
        const label = dA.toLocaleDateString('pt-BR', { timeZone: TZ_BR, weekday: 'short' });
        return {
          label:    label.charAt(0).toUpperCase() + label.slice(1),
          atual:    registros.filter(r => r.data_cadastro?.startsWith?.(sA)).length,
          anterior: registros.filter(r => r.data_cadastro?.startsWith?.(sB)).length,
        };
      } catch { return { label:'??', atual:0, anterior:0 }; }
    });

    const dadosInsight = { totalGeral: registros.length, semanaAtual, semanaAnterior, crescimentoPct, funil, gargalo, eficiente, porOrigem, porStatus };
    const insights = gerarInsights(dadosInsight);

    const geradoEm = agora.toLocaleDateString('pt-BR', {
      timeZone: TZ_BR, day:'2-digit', month:'2-digit', year:'numeric',
      hour:'2-digit', minute:'2-digit',
    });

    const aprovados    = porStatus['aprovado']      || 0;
    const emProcesso   = (porStatus['em_processo']  || 0) + (porStatus['atendimento'] || 0) + (porStatus['reuniao'] || 0);
    const semInteresse = porStatus['sem_interesse'] || 0;
    const recusados    = porStatus['recusado']      || 0;

    return {
      totalGeral: registros.length,
      semanaAtual, semanaAnterior, crescimentoPct,
      porStatus, porOrigem, funil, gargalo, eficiente,
      evolucao, comparativo, pizzaOrigem, barrasEtapas, insights,
      geradoEm, aprovados, emProcesso, semInteresse, recusados,
      taxaConversao: pct(aprovados, registros.length),
    };
  } catch (err) {
    // Fallback seguro — nunca deixa a página crashar
    console.error('[BHFlow] relatorioEngine error:', err);
    const now = new Date().toLocaleDateString('pt-BR', { timeZone: TZ_BR, day:'2-digit', month:'2-digit', year:'numeric' });
    const emptyFunil = PIPELINE_STAGES.map(s => ({ ...s, count:0, pct:0, conversao:0 }));
    return {
      totalGeral:0, semanaAtual:0, semanaAnterior:0, crescimentoPct:0,
      porStatus:{}, porOrigem:{}, funil:emptyFunil, gargalo:null, eficiente:null,
      evolucao:[], comparativo:[], pizzaOrigem:[], barrasEtapas:[], insights:[],
      geradoEm:now, aprovados:0, emProcesso:0, semInteresse:0, recusados:0, taxaConversao:0,
    };
  }
}
