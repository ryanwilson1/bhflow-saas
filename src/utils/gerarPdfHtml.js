// src/utils/gerarPdfHtml.js
// Gera HTML standalone para PDF/impressão — sem dependências externas
// Usa CSS puro para gráficos → 100% estável em qualquer navegador

const CORES = ['#2563EB','#7C3AED','#059669','#EA580C','#D97706','#0891B2','#DC2626','#6B7280'];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]
  );
}

/** Barra de progresso CSS pura (robusta em print) */
function barraCSS(valor, max, cor, height = 10) {
  const pct = max > 0 ? Math.min(100, Math.round((valor / max) * 100)) : 0;
  return `
    <div style="height:${height}px;background:#EEF3F9;border-radius:99px;overflow:hidden;margin-top:4px">
      <div style="height:100%;width:${pct}%;background:${cor};border-radius:99px;"></div>
    </div>`;
}

/** Gráfico de barras CSS (layout vertical) */
function graficoBarra(dados, cor = '#2563EB', altura = 140) {
  if (!dados.length) return '<p style="color:#8A9BB0;font-size:12px;text-align:center;padding:20px">Sem dados</p>';
  const maxVal = Math.max(...dados.map(d => d.value || d.total || 0), 1);
  const barW   = Math.max(20, Math.floor(400 / dados.length) - 8);
  const bars   = dados.map((d, i) => {
    const v   = d.value ?? d.total ?? 0;
    const h   = Math.round((v / maxVal) * altura);
    const c   = d.fill || CORES[i % CORES.length] || cor;
    const label = String(d.name ?? '').length > 10 ? String(d.name).slice(0,9)+'…' : String(d.name ?? '');
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
        <span style="font-size:11px;font-weight:700;color:${c}">${v}</span>
        <div style="width:${barW}px;height:${h}px;background:${c};border-radius:4px 4px 0 0;min-height:${v>0?4:0}px"></div>
        <span style="font-size:9.5px;color:#485E75;text-align:center;max-width:${barW+8}px;word-break:break-word;line-height:1.2">${esc(label)}</span>
      </div>`;
  }).join('');
  return `
    <div style="display:flex;align-items:flex-end;justify-content:center;gap:6px;height:${altura+50}px;padding-top:10px">
      ${bars}
    </div>`;
}

/** Legenda de pizza CSS */
function legendaPizza(dados) {
  return dados.map((d, i) => {
    const c = CORES[i % CORES.length];
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="width:10px;height:10px;border-radius:50%;background:${c};flex-shrink:0"></div>
        <span style="font-size:11px;color:#485E75;flex:1">${esc(d.name)}</span>
        <span style="font-size:11px;font-weight:700;color:#1F3A5F">${d.value}</span>
      </div>`;
  }).join('');
}

/** Tabela do funil */
function tabelaFunil(funil, total) {
  const rows = funil.map((s, i) => {
    const conv = i === 0
      ? '<span style="color:#8A9BB0;font-size:10px">Entrada</span>'
      : (() => {
          const bg = s.conversao >= 50 ? '#ECFDF5' : s.conversao >= 20 ? '#FFFBEB' : '#FEF2F2';
          const cl = s.conversao >= 50 ? '#059669' : s.conversao >= 20 ? '#D97706' : '#DC2626';
          return `<span style="background:${bg};color:${cl};border-radius:99px;padding:2px 8px;font-weight:700;font-size:10px">${s.conversao}%</span>`;
        })();
    const p = total > 0 ? Math.round((s.count/total)*100) : 0;
    const bg = i % 2 === 0 ? '#fff' : '#F7FAFD';
    return `
      <tr style="background:${bg}">
        <td style="padding:8px 12px;border-bottom:1px solid #EEF3F9">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block;flex-shrink:0"></span>
            <span style="font-size:11.5px;font-weight:600;color:#0E1C2F">${esc(s.label)}</span>
          </div>
        </td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #EEF3F9;font-weight:700;color:${s.color};font-size:12px">${s.count}</td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #EEF3F9;color:#485E75;font-size:11px">${p}%</td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #EEF3F9">${conv}</td>
      </tr>`;
  }).join('');

  return `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#F7FAFD">
          <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#485E75;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #DDE6F0">Etapa</th>
          <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#485E75;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #DDE6F0">Qtd</th>
          <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#485E75;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #DDE6F0">% Total</th>
          <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#485E75;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px solid #DDE6F0">Conversão</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/** Funil visual CSS */
function funilVisual(funil, total) {
  const ativos = funil.filter(f => f.id !== 'recusado');
  const max    = Math.max(...ativos.map(f => f.count), 1);
  return ativos.map(s => {
    const p  = total > 0 ? Math.round((s.count/total)*100) : 0;
    const w  = Math.max(8, Math.round((s.count/max)*100));
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:11px;font-weight:600;color:#485E75">${esc(s.label)}</span>
          <span style="font-size:11px;font-weight:700;color:${s.color}">${s.count} <span style="color:#8A9BB0;font-weight:400">(${p}%)</span></span>
        </div>
        <div style="height:9px;background:#EEF3F9;border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${w}%;background:linear-gradient(90deg,${s.color}99,${s.color});border-radius:99px"></div>
        </div>
      </div>`;
  }).join('');
}

/** Insights */
function renderInsights(insights) {
  const map = {
    positivo: { bg:'#ECFDF5', border:'#6EE7B7', color:'#065F46' },
    negativo: { bg:'#FEF2F2', border:'#FCA5A5', color:'#991B1B' },
    alerta:   { bg:'#FFFBEB', border:'#FCD34D', color:'#92400E' },
    neutro:   { bg:'#F0F9FF', border:'#7DD3FC', color:'#0C4A6E' },
    info:     { bg:'#F5F3FF', border:'#C4B5FD', color:'#4C1D95' },
  };
  return insights.map(ins => {
    const s = map[ins.tipo] || map.info;
    return `
      <div style="display:flex;gap:12px;align-items:flex-start;background:${s.bg};border:1px solid ${s.border};border-radius:8px;padding:10px 14px;margin-bottom:8px">
        <span style="font-size:18px;flex-shrink:0;line-height:1.3">${ins.icon}</span>
        <p style="font-size:12.5px;color:${s.color};line-height:1.55;font-weight:500;margin:0">${esc(ins.texto)}</p>
      </div>`;
  }).join('');
}

/** Linha de KPI */
function kpiRow(label, value) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #EEF3F9">
      <span style="font-size:12px;color:#485E75">${esc(String(label))}</span>
      <span style="font-size:12.5px;font-weight:700;color:#1F3A5F">${esc(String(value))}</span>
    </div>`;
}

// ─── FUNÇÃO PRINCIPAL ────────────────────────────────────────────────────────
export function gerarHTMLRelatorio(dados) {
  const {
    totalGeral, semanaAtual, semanaAnterior, crescimentoPct,
    aprovados, emProcesso, semInteresse, recusados, taxaConversao,
    funil, gargalo, eficiente, insights, geradoEm,
    evolucao, comparativo, pizzaOrigem, barrasEtapas, porOrigem,
  } = dados;

  const crescCor  = crescimentoPct >= 0 ? '#6EE7B7' : '#FCA5A5';
  const crescSign = crescimentoPct >= 0 ? '+' : '';
  const totalFunil = funil.reduce((a, f) => a + f.count, 0) || totalGeral;

  // Evolução (linha → barras CSS)
  const maxEvolucao = Math.max(...evolucao.map(d => d.total), 1);
  const evolucaoHTML = evolucao.map(d => {
    const h = Math.max(2, Math.round((d.total / maxEvolucao) * 80));
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1">
        <span style="font-size:9px;font-weight:700;color:#2563EB;min-height:14px">${d.total || ''}</span>
        <div style="width:100%;height:${h}px;background:#2563EB;border-radius:3px 3px 0 0;min-height:2px"></div>
        <span style="font-size:8px;color:#8A9BB0;transform:rotate(-40deg);transform-origin:center;white-space:nowrap">${d.label}</span>
      </div>`;
  }).join('');

  // Comparativo
  const maxComp = Math.max(...comparativo.flatMap(d => [d.atual, d.anterior]), 1);
  const comparHTML = comparativo.map(d => {
    const hA = Math.max(2, Math.round((d.atual    / maxComp) * 70));
    const hB = Math.max(2, Math.round((d.anterior / maxComp) * 70));
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1">
        <div style="display:flex;align-items:flex-end;gap:2px;height:74px">
          <div style="width:12px;height:${hA}px;background:#2563EB;border-radius:2px 2px 0 0;min-height:2px" title="Atual: ${d.atual}"></div>
          <div style="width:12px;height:${hB}px;background:#BFDBFE;border-radius:2px 2px 0 0;min-height:2px" title="Anterior: ${d.anterior}"></div>
        </div>
        <span style="font-size:9px;color:#8A9BB0">${esc(d.label)}</span>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório Corporativo — B&H Flow</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #F1F5FB;
    color: #0E1C2F;
    font-size: 13px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { max-width: 794px; margin: 0 auto; padding: 24px; }
  .card { background:#fff; border-radius:10px; padding:18px 20px; border:1.5px solid #DDE6F0; margin-bottom:14px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
  .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:14px; }
  .grid6 { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; margin-bottom:14px; }
  h3 { font-size:13px; font-weight:700; color:#1F3A5F; margin-bottom:12px; }
  h4 { font-size:12px; font-weight:700; color:#1F3A5F; margin-bottom:10px; }
  .kpi-box { background:#fff; border-radius:10px; padding:14px 16px; border:1.5px solid #DDE6F0; }
  .kpi-val { font-size:26px; font-weight:800; line-height:1; margin:6px 0 4px; }
  .kpi-lbl { font-size:11px; font-weight:600; color:#485E75; }
  .kpi-sub { font-size:10px; color:#8A9BB0; margin-top:2px; }
  @media print {
    body { background:#fff; }
    .page { max-width:100%; padding:12px 16px; }
    .card { break-inside:avoid; page-break-inside:avoid; }
    .grid2 { break-inside:avoid; }
    .no-break { break-inside:avoid; page-break-inside:avoid; }
    @page { size:A4; margin:12mm 10mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- CABEÇALHO -->
  <div style="background:linear-gradient(135deg,#142845 0%,#1F3A5F 60%,#2563EB 100%);border-radius:12px;padding:28px 32px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:10px;letter-spacing:.15em;color:#C4962A;font-weight:700;text-transform:uppercase;margin-bottom:6px">
        B&H Flow · CRM de Recrutamento
      </div>
      <div style="font-size:20px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:8px">
        Relatório Corporativo de Recrutamento
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,.6)">
        📅 Semana atual &nbsp;·&nbsp; 🕐 Gerado em: ${esc(geradoEm)} &nbsp;·&nbsp; 👥 Base: ${totalGeral} candidatos
      </div>
    </div>
    <div style="background:rgba(255,255,255,.1);border-radius:10px;padding:14px 20px;border:1px solid rgba(255,255,255,.15);text-align:center;flex-shrink:0">
      <div style="font-size:10px;color:rgba(255,255,255,.5);font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Crescimento Semanal</div>
      <div style="font-size:34px;font-weight:800;color:${crescCor};line-height:1">${crescSign}${crescimentoPct}%</div>
      <div style="font-size:10px;color:rgba(255,255,255,.45);margin-top:4px">vs semana anterior</div>
    </div>
  </div>

  <!-- KPIs -->
  <div class="grid6" style="margin-bottom:14px">
    ${[
      { icon:'👥', val:totalGeral,         lbl:'Total Candidatos',    color:'#1F3A5F', sub:'' },
      { icon:'📅', val:semanaAtual,         lbl:'Novos Esta Semana',   color:'#2563EB', sub:`${semanaAnterior} semana anterior` },
      { icon:'✅', val:aprovados,           lbl:'Aprovados',           color:'#059669', sub:`Taxa: ${taxaConversao}%` },
      { icon:'⚙️', val:emProcesso,          lbl:'Em Processo Ativo',   color:'#EA580C', sub:'' },
      { icon:'🎯', val:`${taxaConversao}%`, lbl:'Taxa de Conversão',   color:'#7C3AED', sub:'Triagem → Aprovado' },
      { icon:'⚠️', val:gargalo?.count??'—', lbl:'No Gargalo',          color:'#D97706', sub:gargalo?.label??'Sem gargalo' },
    ].map(k => `
      <div class="kpi-box">
        <div style="font-size:18px;background:${k.color}18;border-radius:8px;padding:5px 7px;display:inline-block;line-height:1;margin-bottom:8px">${k.icon}</div>
        <div class="kpi-val" style="color:${k.color}">${esc(String(k.val))}</div>
        <div class="kpi-lbl">${esc(k.lbl)}</div>
        ${k.sub ? `<div class="kpi-sub">${esc(k.sub)}</div>` : ''}
      </div>`).join('')}
  </div>

  <!-- INSIGHTS -->
  ${insights.length ? `
  <div class="card no-break">
    <h3>🧠 Insights Automáticos</h3>
    ${renderInsights(insights)}
  </div>` : ''}

  <!-- EVOLUÇÃO + COMPARATIVO -->
  <div class="grid2">
    <div class="card no-break">
      <h3>📈 Evolução dos Últimos 14 Dias</h3>
      <div style="display:flex;align-items:flex-end;gap:3px;height:110px;padding-top:8px">
        ${evolucaoHTML}
      </div>
    </div>
    <div class="card no-break">
      <h3>📊 Comparativo Semanal</h3>
      <div style="display:flex;align-items:flex-end;gap:4px;height:110px;padding-top:4px">
        ${comparHTML}
      </div>
      <div style="display:flex;gap:16px;margin-top:10px;font-size:10px">
        <span><span style="display:inline-block;width:10px;height:10px;background:#2563EB;border-radius:2px;margin-right:4px"></span>Semana Atual</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#BFDBFE;border-radius:2px;margin-right:4px"></span>Semana Anterior</span>
      </div>
    </div>
  </div>

  <!-- BARRAS ETAPAS + PIZZA ORIGENS -->
  <div class="grid2">
    <div class="card no-break">
      <h3>🗂️ Candidatos por Etapa</h3>
      ${graficoBarra(barrasEtapas, '#2563EB', 90)}
    </div>
    <div class="card no-break">
      <h3>🍕 Origem dos Candidatos</h3>
      ${pizzaOrigem.length ? legendaPizza(pizzaOrigem) : '<p style="color:#8A9BB0;font-size:12px;text-align:center;padding:20px">Sem dados</p>'}
    </div>
  </div>

  <!-- FUNIL VISUAL + TABELA -->
  <div class="grid2">
    <div class="card no-break">
      <h3>🔽 Funil de Conversão</h3>
      ${totalGeral > 0 ? funilVisual(funil, totalFunil) : '<p style="color:#8A9BB0;font-size:12px;text-align:center;padding:20px">Sem dados</p>'}
    </div>
    <div class="card no-break">
      <h3>📋 Análise de Conversão por Etapa</h3>
      <div style="overflow:hidden">${tabelaFunil(funil, totalFunil)}</div>
    </div>
  </div>

  <!-- RESUMO EXECUTIVO -->
  <div class="card no-break">
    <h3>📝 Resumo Executivo</h3>
    <div class="grid2" style="margin-bottom:0">
      <div>
        <h4>Desempenho da Semana</h4>
        ${[
          ['Total de candidatos na base',     totalGeral],
          ['Novos cadastros esta semana',      semanaAtual],
          ['Cadastros semana anterior',        semanaAnterior],
          ['Variação semanal',                 `${crescimentoPct >= 0 ? '+' : ''}${crescimentoPct}%`],
          ['Aprovados / Credenciados',         aprovados],
          ['Taxa de conversão geral',          `${taxaConversao}%`],
          ['Em processo ativo',                emProcesso],
          ['Sem interesse / Recusados',        semInteresse + recusados],
        ].map(([l,v]) => kpiRow(l,v)).join('')}
      </div>
      <div>
        <h4>Destaques e Recomendações</h4>
        ${[
          ['Gargalo Identificado', gargalo ? `"${gargalo.label}" — ${gargalo.count} candidatos acumulados.` : 'Nenhum gargalo crítico identificado.'],
          ['Canal Mais Eficiente', eficiente ? `"${eficiente.origem}" — ${eficiente.taxa}% de aprovação (${eficiente.aprovados}/${eficiente.total}).` : 'Dados insuficientes para análise.'],
          ['Tendência',            crescimentoPct > 0 ? `Expansão: +${crescimentoPct}% no volume.` : crescimentoPct < 0 ? `Queda: ${crescimentoPct}% no volume.` : 'Volume estável.'],
          ['Ação Recomendada',     emProcesso > 0 ? `${emProcesso} candidatos aguardam progressão no pipeline.` : 'Nenhum candidato em processo ativo.'],
        ].map(([label, valor]) => `
          <div style="background:#F7FAFD;border-radius:7px;padding:9px 13px;font-size:12px;color:#485E75;line-height:1.5;margin-bottom:8px">
            <strong style="color:#1F3A5F;display:block;margin-bottom:2px">${esc(label)}</strong>
            ${esc(valor)}
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- RODAPÉ -->
  <div style="text-align:center;padding:14px 0 4px;color:#8A9BB0;font-size:10px">
    B&H Flow CRM · Relatório gerado em ${esc(geradoEm)} · Documento Confidencial · Uso Interno
  </div>

</div>
</body>
</html>`;
}
