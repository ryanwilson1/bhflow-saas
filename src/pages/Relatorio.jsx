// src/pages/Relatorio.jsx — Relatório Corporativo · hardened para produção
import { Component, useMemo, useRef, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { calcularRelatorio } from '@/utils/relatorioEngine';
import { gerarHTMLRelatorio } from '@/utils/gerarPdfHtml';
import { Spinner } from '@/components/ui/index';
import { useToast } from '@/contexts/ToastContext';

// ── Paletas ──────────────────────────────────────────────────────────────────
const CORES = ['#2563EB','#7C3AED','#059669','#EA580C','#D97706','#0891B2','#DC2626','#6B7280'];
const INSIGHT_STYLE = {
  positivo: { bg:'#ECFDF5', border:'#6EE7B7', color:'#065F46' },
  negativo: { bg:'#FEF2F2', border:'#FCA5A5', color:'#991B1B' },
  alerta:   { bg:'#FFFBEB', border:'#FCD34D', color:'#92400E' },
  neutro:   { bg:'#F0F9FF', border:'#7DD3FC', color:'#0C4A6E' },
  info:     { bg:'#F5F3FF', border:'#C4B5FD', color:'#4C1D95' },
};

// ── ErrorBoundary para gráficos ──────────────────────────────────────────────
class ChartBoundary extends Component {
  constructor(props) { super(props); this.state = { error: false }; }
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          height:this.props.height||180, background:'#F7FAFD', borderRadius:8,
          border:'1.5px dashed #DDE6F0', color:'#8A9BB0', fontSize:12 }}>
          Gráfico indisponível
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Tooltip padronizado ──────────────────────────────────────────────────────
function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1.5px solid #DDE6F0', borderRadius:8,
      padding:'10px 14px', fontSize:12, boxShadow:'0 4px 18px rgba(14,28,47,.10)', maxWidth:200 }}>
      {label && <p style={{ fontWeight:700, color:'#0E1C2F', marginBottom:4 }}>{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color||p.fill||'#2563EB', fontWeight:600 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Wrappers visuais ─────────────────────────────────────────────────────────
function Card({ children, style={}, className='' }) {
  return (
    <div className={className} style={{ background:'#fff', borderRadius:12,
      padding:'20px 22px', border:'1.5px solid #DDE6F0',
      boxShadow:'0 1px 4px rgba(14,28,47,.06)', ...style }}>
      {children}
    </div>
  );
}

function SecTitle({ children, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <h3 style={{ fontSize:13.5, fontWeight:800, color:'#1F3A5F', letterSpacing:'-.01em' }}>{children}</h3>
      {sub && <p style={{ fontSize:11, color:'#8A9BB0', marginTop:2 }}>{sub}</p>}
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, value, label, sub, color, delta }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'18px 16px',
      border:'1.5px solid #DDE6F0', boxShadow:'0 1px 4px rgba(14,28,47,.06)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <span style={{ fontSize:20, background:color+'18', borderRadius:9,
          padding:'5px 8px', lineHeight:1 }}>{icon}</span>
        {delta != null && (
          <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:99,
            background:delta>=0?'#ECFDF5':'#FEF2F2', color:delta>=0?'#059669':'#DC2626' }}>
            {delta>=0?'▲':'▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div style={{ fontSize:30, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:11.5, fontWeight:600, color:'#485E75' }}>{label}</div>
      {sub && <div style={{ fontSize:10.5, color:'#8A9BB0', marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ── Insight ───────────────────────────────────────────────────────────────────
function InsightCard({ insight }) {
  const s = INSIGHT_STYLE[insight.tipo] || INSIGHT_STYLE.info;
  return (
    <div style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:9,
      padding:'11px 15px', display:'flex', gap:11, alignItems:'flex-start' }}>
      <span style={{ fontSize:19, flexShrink:0, lineHeight:1.3 }}>{insight.icon}</span>
      <p style={{ fontSize:12.5, color:s.color, lineHeight:1.55, fontWeight:500, margin:0 }}>
        {insight.texto}
      </p>
    </div>
  );
}

// ── Funil visual ──────────────────────────────────────────────────────────────
function FunilVisual({ funil, total }) {
  const ativos = funil.filter(f => f.id !== 'recusado' && f.count >= 0);
  const max    = Math.max(...ativos.map(f=>f.count), 1);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {ativos.map(stage => {
        const p = total > 0 ? Math.round((stage.count/total)*100) : 0;
        const w = Math.max(6, Math.round((stage.count/max)*100));
        return (
          <div key={stage.id}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#485E75' }}>{stage.label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:stage.color }}>
                {stage.count} <span style={{ color:'#8A9BB0', fontWeight:400 }}>({p}%)</span>
              </span>
            </div>
            <div style={{ height:9, background:'#EEF3F9', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${w}%`,
                background:`linear-gradient(90deg,${stage.color}99,${stage.color})`,
                borderRadius:99, transition:'width .5s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tabela de conversão ───────────────────────────────────────────────────────
function TabelaFunil({ funil, total }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11.5 }}>
        <thead>
          <tr style={{ background:'#F7FAFD' }}>
            {['Etapa','Candidatos','% Total','Conversão'].map(h => (
              <th key={h} style={{ padding:'8px 10px', textAlign:h==='Etapa'?'left':'center',
                fontWeight:700, color:'#485E75', fontSize:10, textTransform:'uppercase',
                letterSpacing:'.04em', borderBottom:'1.5px solid #DDE6F0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {funil.map((s,i) => (
            <tr key={s.id} style={{ background:i%2===0?'#fff':'#F7FAFD' }}
              onMouseEnter={e=>e.currentTarget.style.background='#EBF3FF'}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#fff':'#F7FAFD'}>
              <td style={{ padding:'8px 10px', borderBottom:'1px solid #EEF3F9' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%',
                    background:s.color, display:'inline-block', flexShrink:0 }} />
                  <span style={{ fontWeight:600, color:'#0E1C2F', fontSize:11.5 }}>{s.label}</span>
                </div>
              </td>
              <td style={{ padding:'8px 10px', textAlign:'center',
                borderBottom:'1px solid #EEF3F9', fontWeight:700, color:s.color }}>{s.count}</td>
              <td style={{ padding:'8px 10px', textAlign:'center',
                borderBottom:'1px solid #EEF3F9', color:'#485E75' }}>
                {total>0?`${Math.round((s.count/total)*100)}%`:'—'}
              </td>
              <td style={{ padding:'8px 10px', textAlign:'center', borderBottom:'1px solid #EEF3F9' }}>
                {i===0
                  ? <span style={{ color:'#8A9BB0', fontSize:10 }}>Entrada</span>
                  : <span style={{
                      background:s.conversao>=50?'#ECFDF5':s.conversao>=20?'#FFFBEB':'#FEF2F2',
                      color:s.conversao>=50?'#059669':s.conversao>=20?'#D97706':'#DC2626',
                      borderRadius:99, padding:'2px 8px', fontWeight:700, fontSize:10.5,
                    }}>{s.conversao}%</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function Relatorio({ registros, loading }) {
  const toast      = useToast();
  const [exporting, setExporting] = useState(false);

  // useMemo: não recalcula se registros não mudar
  const dados = useMemo(() => calcularRelatorio(registros), [registros]);

  // ── Export PDF via janela dedicada (sem html2canvas) ─────────────────────
  const exportarPDF = () => {
    if (exporting) return;
    setExporting(true);
    try {
      const html   = gerarHTMLRelatorio(dados);
      const win    = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
      if (!win) {
        toast('Popup bloqueado! Permita pop-ups para este site.', 'warning');
        setExporting(false);
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
      // Aguarda carregamento completo antes do print
      win.onload = () => {
        setTimeout(() => {
          win.focus();
          win.print();
          // Não fecha a janela — usuário pode salvar como PDF
        }, 400);
      };
      toast('Janela de PDF aberta — salve como PDF no diálogo de impressão.', 'success', 5000);
    } catch (err) {
      console.error('[BHFlow] exportarPDF:', err);
      toast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
    setExporting(false);
  };

  // ── Imprimir diretamente a página (Print CSS cuida do layout) ────────────
  const imprimir = () => window.print();

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner /></div>
  );

  const totalFunil = dados.funil.reduce((a,f)=>a+f.count,0) || dados.totalGeral;

  return (
    <div style={{ maxWidth:1140, margin:'0 auto', fontFamily:"'Plus Jakarta Sans',sans-serif" }} className="fade">

      {/* ── Toolbar (oculta no print) ─────────────────────────── */}
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1F3A5F', letterSpacing:'-.02em' }}>
            Relatório Corporativo
          </h1>
          <p style={{ color:'#8A9BB0', fontSize:13, marginTop:4 }}>
            Análise completa de recrutamento · Gerado em {dados.geradoEm}
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={imprimir}
            style={{ background:'transparent', color:'#485E75', border:'1.5px solid #DDE6F0',
              borderRadius:8, padding:'10px 18px', fontWeight:600, fontSize:13,
              cursor:'pointer', fontFamily:'inherit' }}>
            🖨️ Imprimir
          </button>
          <button onClick={exportarPDF} disabled={exporting}
            style={{ background:'#1F3A5F', color:'#fff', border:'none', borderRadius:8,
              padding:'10px 20px', fontWeight:700, fontSize:13,
              cursor:exporting?'not-allowed':'pointer', fontFamily:'inherit',
              opacity:exporting?.7:1, boxShadow:'0 2px 10px rgba(31,58,95,.3)' }}>
            {exporting ? '⏳ Gerando…' : '📥 Exportar PDF'}
          </button>
        </div>
      </div>

      {/* ══ CABEÇALHO CORPORATIVO ══════════════════════════════ */}
      <div style={{ background:'linear-gradient(135deg,#142845 0%,#1F3A5F 60%,#2563EB 100%)',
        borderRadius:12, padding:'28px 32px', marginBottom:18,
        display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:'.15em', color:'#C4962A', fontWeight:700,
            textTransform:'uppercase', marginBottom:6 }}>
            B&H Flow · CRM de Recrutamento
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:8 }}>
            Relatório Corporativo de Recrutamento
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', display:'flex', gap:18, flexWrap:'wrap' }}>
            <span>📅 Semana atual</span>
            <span>🕐 Gerado em: {dados.geradoEm}</span>
            <span>👥 Base: {dados.totalGeral} candidatos</span>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,.1)', borderRadius:10,
          padding:'14px 22px', border:'1px solid rgba(255,255,255,.15)', textAlign:'center', flexShrink:0 }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', fontWeight:600,
            textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>
            Crescimento Semanal
          </div>
          <div style={{ fontSize:36, fontWeight:800, lineHeight:1,
            color:dados.crescimentoPct>=0?'#6EE7B7':'#FCA5A5' }}>
            {dados.crescimentoPct>=0?'+':''}{dados.crescimentoPct}%
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', marginTop:4 }}>vs semana anterior</div>
        </div>
      </div>

      {/* ══ KPIs ═══════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:12, marginBottom:16 }}>
        <KpiCard icon="👥" value={dados.totalGeral}    label="Total Candidatos"    color="#1F3A5F" />
        <KpiCard icon="📅" value={dados.semanaAtual}   label="Novos Esta Semana"  color="#2563EB"
          delta={dados.semanaAnterior>0?dados.crescimentoPct:null}
          sub={`${dados.semanaAnterior} semana anterior`} />
        <KpiCard icon="✅" value={dados.aprovados}      label="Aprovados"          color="#059669" sub={`Taxa: ${dados.taxaConversao}%`} />
        <KpiCard icon="⚙️" value={dados.emProcesso}    label="Em Processo Ativo"  color="#EA580C" />
        <KpiCard icon="🎯" value={`${dados.taxaConversao}%`} label="Taxa Conversão" color="#7C3AED" sub="Triagem → Aprovado" />
        <KpiCard icon="⚠️" value={dados.gargalo?.count??'—'} label="No Gargalo" color="#D97706"
          sub={dados.gargalo?.label??'Sem gargalo'} />
      </div>

      {/* ══ INSIGHTS ═══════════════════════════════════════════ */}
      {dados.insights.length > 0 && (
        <Card style={{ marginBottom:16 }}>
          <SecTitle sub="Análise automática baseada nos dados reais">🧠 Insights Automáticos</SecTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {dados.insights.map((ins,i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </Card>
      )}

      {/* ══ LINHA 1: Evolução + Comparativo ════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Card>
          <SecTitle sub="Últimos 14 dias">📈 Evolução de Cadastros</SecTitle>
          <ChartBoundary height={190}>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={dados.evolucao} margin={{ top:4, right:14, left:-12, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F9" />
                <XAxis dataKey="label" tick={{ fontSize:10, fill:'#8A9BB0' }} interval={1} />
                <YAxis tick={{ fontSize:10, fill:'#8A9BB0' }} allowDecimals={false} width={28} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="total" name="Cadastros"
                  stroke="#2563EB" strokeWidth={2.5}
                  dot={{ fill:'#2563EB', r:3 }} activeDot={{ r:6 }}
                  isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </ChartBoundary>
        </Card>

        <Card>
          <SecTitle sub="Semana atual vs semana anterior">📊 Comparativo Semanal</SecTitle>
          <ChartBoundary height={190}>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={dados.comparativo} margin={{ top:4, right:14, left:-12, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F9" />
                <XAxis dataKey="label" tick={{ fontSize:10, fill:'#8A9BB0' }} />
                <YAxis tick={{ fontSize:10, fill:'#8A9BB0' }} allowDecimals={false} width={28} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="atual"    name="Semana Atual"    fill="#2563EB" radius={[3,3,0,0]} isAnimationActive={true} />
                <Bar dataKey="anterior" name="Semana Anterior" fill="#BFDBFE" radius={[3,3,0,0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBoundary>
        </Card>
      </div>

      {/* ══ LINHA 2: Barras etapas + Pizza ═════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Card>
          <SecTitle sub="Candidatos em cada etapa">🗂️ Candidatos por Etapa</SecTitle>
          <ChartBoundary height={200}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dados.barrasEtapas} layout="vertical"
                margin={{ top:4, right:24, left:4, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:10, fill:'#8A9BB0' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name"
                  tick={{ fontSize:9.5, fill:'#485E75' }} width={114} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="total" name="Candidatos" radius={[0,4,4,0]} isAnimationActive={true}>
                  {dados.barrasEtapas.map((e,i) => <Cell key={i} fill={e.fill||CORES[i%CORES.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBoundary>
        </Card>

        <Card>
          <SecTitle sub="Distribuição percentual por canal">🍕 Origem dos Candidatos</SecTitle>
          {dados.pizzaOrigem.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
              height:200, color:'#8A9BB0', fontSize:13 }}>Sem dados disponíveis</div>
          ) : (
            <ChartBoundary height={200}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dados.pizzaOrigem} cx="44%" cy="50%"
                    innerRadius={52} outerRadius={80}
                    paddingAngle={3} dataKey="value" isAnimationActive={true}>
                    {dados.pizzaOrigem.map((_,i) => <Cell key={i} fill={CORES[i%CORES.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v,n]}
                    contentStyle={{ background:'#fff', border:'1.5px solid #DDE6F0', borderRadius:8, fontSize:12 }} />
                  <Legend iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize:10.5, color:'#485E75' }}
                    layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </ChartBoundary>
          )}
        </Card>
      </div>

      {/* ══ LINHA 3: Funil + Tabela ════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:14, marginBottom:14 }}>
        <Card>
          <SecTitle sub="Fluxo por etapa do pipeline">🔽 Funil de Conversão</SecTitle>
          {dados.totalGeral === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'#8A9BB0', fontSize:13 }}>
              Nenhum dado disponível
            </div>
          ) : (
            <FunilVisual funil={dados.funil} total={totalFunil} />
          )}
        </Card>

        <Card>
          <SecTitle sub="Taxa de conversão entre etapas">📋 Análise de Conversão</SecTitle>
          <TabelaFunil funil={dados.funil} total={totalFunil} />
        </Card>
      </div>

      {/* ══ RESUMO EXECUTIVO ═══════════════════════════════════ */}
      <Card style={{ marginBottom:4 }}>
        <SecTitle sub="Síntese para apresentação executiva">📝 Resumo Executivo</SecTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <div>
            <h4 style={{ fontSize:12.5, fontWeight:700, color:'#1F3A5F', marginBottom:10 }}>
              Desempenho da Semana
            </h4>
            {[
              ['Total de candidatos na base',     dados.totalGeral],
              ['Novos cadastros esta semana',      dados.semanaAtual],
              ['Cadastros semana anterior',        dados.semanaAnterior],
              ['Variação semanal',                 `${dados.crescimentoPct>=0?'+':''}${dados.crescimentoPct}%`],
              ['Aprovados / Credenciados',         dados.aprovados],
              ['Taxa de conversão geral',          `${dados.taxaConversao}%`],
              ['Em processo ativo',                dados.emProcesso],
              ['Sem interesse / Recusados',        dados.semInteresse + dados.recusados],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'7px 0', borderBottom:'1px solid #EEF3F9' }}>
                <span style={{ fontSize:12, color:'#485E75' }}>{l}</span>
                <span style={{ fontSize:12.5, fontWeight:700, color:'#1F3A5F' }}>{v}</span>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize:12.5, fontWeight:700, color:'#1F3A5F', marginBottom:10 }}>
              Destaques e Recomendações
            </h4>
            {[
              ['Gargalo identificado',
                dados.gargalo
                  ? `"${dados.gargalo.label}" — ${dados.gargalo.count} candidatos acumulados.`
                  : 'Nenhum gargalo crítico no pipeline.'],
              ['Canal mais eficiente',
                dados.eficiente
                  ? `"${dados.eficiente.origem}" — ${dados.eficiente.taxa}% de aprovação.`
                  : 'Dados insuficientes para análise de canal.'],
              ['Tendência',
                dados.crescimentoPct > 0
                  ? `Expansão: crescimento de ${dados.crescimentoPct}% no volume.`
                  : dados.crescimentoPct < 0
                  ? `Queda de ${Math.abs(dados.crescimentoPct)}% — revisar captação.`
                  : 'Volume estável em relação à semana anterior.'],
              ['Ação recomendada',
                dados.emProcesso > 0
                  ? `${dados.emProcesso} candidatos aguardam progressão. Acesse o Pipeline.`
                  : 'Nenhum candidato em processo ativo no momento.'],
            ].map(([label, valor]) => (
              <div key={label} style={{ background:'#F7FAFD', borderRadius:8,
                padding:'9px 13px', fontSize:12.5, color:'#485E75', lineHeight:1.55, marginBottom:9 }}>
                <strong style={{ color:'#1F3A5F', display:'block', marginBottom:2 }}>{label}</strong>
                {valor}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Rodapé */}
      <div style={{ textAlign:'center', padding:'14px 0 4px', color:'#8A9BB0', fontSize:11 }}>
        B&H Flow CRM · Relatório gerado em {dados.geradoEm} · Documento Confidencial
      </div>
    </div>
  );
}
