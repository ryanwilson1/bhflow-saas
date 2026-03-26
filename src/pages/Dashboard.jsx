// src/pages/Dashboard.jsx
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { STAGE_MAP, TZ_BR } from '@/utils/constants';
import { ultimosDias } from '@/utils/dates';
import { EmptyState, PageHeader, Spinner, StatCard } from '@/components/ui/index';

const CHART_COLORS = ['#2563EB', '#7C3AED', '#059669', '#EA580C', '#D97706', '#0891B2', '#DC2626'];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-sm)', padding: '10px 14px',
      boxShadow: 'var(--sh-md)', fontSize: 13,
    }}>
      <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Card wrapper para gráficos ────────────────────────────────
function ChartCard({ title, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--r-md)',
      padding: '20px 20px 16px', border: '1.5px solid var(--border)',
      boxShadow: 'var(--sh-sm)', ...style,
    }}>
      <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 18 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Dashboard({ registros, loading, daSemana, onNovo }) {
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Spinner />
    </div>
  );

  const aprovados  = registros.filter(r => r.status === 'aprovado').length;
  const emProcesso = registros.filter(r => r.status === 'em_processo').length;
  const hoje = new Date().toLocaleDateString('pt-BR', {
    timeZone: TZ_BR, weekday: 'long', day: 'numeric', month: 'long',
  });

  // ── Dados para gráficos ──────────────────────────────────────

  // 1. Barras: candidatos por origem
  const porOrigem = Object.entries(
    registros.reduce((a, r) => { const k = r.origem || 'Outros'; a[k] = (a[k] || 0) + 1; return a; }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, total]) => ({ name, total }));

  // 2. Pizza: distribuição por etapa
  const porStatus = Object.entries(
    registros.reduce((a, r) => { const k = r.status || 'novo'; a[k] = (a[k] || 0) + 1; return a; }, {})
  ).map(([id, value]) => ({ name: STAGE_MAP[id]?.label || id, value, color: STAGE_MAP[id]?.color || '#6B7280' }));

  // 3. Linha: cadastros por dia (últimos 14 dias)
  const dias = ultimosDias(14);
  const porDia = dias.map(({ date, label }) => ({
    label,
    total: registros.filter(r => r.data_cadastro?.startsWith(date)).length,
  }));

  // 4. Barras: por etapa do pipeline
  const etapas = Object.entries(
    registros.reduce((a, r) => { const k = r.status || 'novo'; a[k] = (a[k] || 0) + 1; return a; }, {})
  ).map(([id, total]) => ({
    name: STAGE_MAP[id]?.label || id,
    total,
    fill: STAGE_MAP[id]?.color || 'var(--blue)',
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }} className="fade">
      <PageHeader
        title="Dashboard"
        subtitle={hoje.charAt(0).toUpperCase() + hoje.slice(1)}
      />

      {/* ── KPIs ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14, marginBottom: 28,
      }}>
        <StatCard icon="👥" value={registros.length} label="Total de candidatos" color="var(--blue)" />
        <StatCard icon="📅" value={daSemana.length}  label="Esta semana"         color="var(--purple)" />
        <StatCard icon="✅" value={aprovados}          label="Aprovados"           color="var(--green)" />
        <StatCard icon="⚙️" value={emProcesso}         label="Em processo"         color="var(--orange)" />
      </div>

      {registros.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="Nenhum candidato ainda"
          subtitle="Comece cadastrando o primeiro candidato no sistema"
          action={
            <button onClick={onNovo}
              style={{
                background: 'var(--blue)', color: '#fff', border: 'none',
                borderRadius: 'var(--r-sm)', padding: '10px 22px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              + Cadastrar candidato
            </button>
          }
        />
      ) : (
        <>
          {/* ── Linha 1: Linha + Pizza ──────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
            <ChartCard title="📈 Cadastros dos últimos 14 dias">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={porDia} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-lt)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-lt)' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="total" name="Cadastros"
                    stroke="var(--blue)" strokeWidth={2.5}
                    dot={{ fill: 'var(--blue)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🥧 Distribuição por etapa">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={porStatus} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value"
                  >
                    {porStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, n]}
                    contentStyle={{
                      background: 'var(--surface)', border: '1.5px solid var(--border)',
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                  <Legend
                    iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: 'var(--text-mid)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Linha 2: Barras + Barras ───────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ChartCard title="📊 Candidatos por origem">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={porOrigem} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-lt)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-lt)' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Candidatos" radius={[4, 4, 0, 0]}>
                    {porOrigem.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🗂️ Candidatos por etapa do pipeline">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={etapas} layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-lt)' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-mid)' }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Candidatos" radius={[0, 4, 4, 0]}>
                    {etapas.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
