// src/utils/helpers.js
export const gerarId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const truncar = (s, n = 60) =>
  !s ? '' : s.length > n ? s.slice(0, n) + '…' : s;

export const avatarColor = (s = '') => {
  const P = ['#2563EB','#7C3AED','#DB2777','#059669','#D97706','#0891B2','#DC2626'];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return P[Math.abs(h) % P.length];
};

export const limparTelefone  = (t = '') => t.replace(/\D/g, '');
export const validarTelefone = (t = '') => { const d = limparTelefone(t); return d.length >= 10 && d.length <= 11; };
export const validarEmail    = (e = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export const formatarTelefone = (t = '') => {
  const d = limparTelefone(t);
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return t;
};

export const whatsappLink = (t = '') => {
  const d = limparTelefone(t);
  return `https://wa.me/${d.startsWith('55') ? d : '55' + d}`;
};

export function gerarRelatorio(candidatos = [], semana = []) {
  const red = (arr, f) =>
    arr.reduce((a, c) => { const k = f(c); a[k] = (a[k] || 0) + 1; return a; }, {});
  return {
    totalGeral:  candidatos.length,
    totalSemana: semana.length,
    porOrigem:   red(semana, c => c.origem || 'Outros'),
    porStatus:   red(semana, c => c.status || 'novo'),
    geradoEm:    new Date().toISOString(),
  };
}
