// src/utils/dates.js
import { TZ_BR } from './constants';

export function parseDateBR(dataBR) {
  if (!dataBR || typeof dataBR !== 'string') return null;
  const m = dataBR.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function formatDateBR(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const p = iso.trim().split('-');
  if (p.length !== 3) return '';
  return `${p[2]}/${p[1]}/${p[0]}`;
}

export function formatTimestampBR(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleDateString('pt-BR', { timeZone: TZ_BR }); }
  catch { return '—'; }
}

export function hojeISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ_BR });
}

export function agora() { return new Date().toISOString(); }

export function inicioDaSemana() {
  const br = new Date(new Date().toLocaleString('en-US', { timeZone: TZ_BR }));
  br.setDate(br.getDate() - br.getDay());
  br.setHours(0, 0, 0, 0);
  return br;
}

export function mascaraDataBR(v) {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

/** Retorna os últimos N dias no formato {date, label} para gráficos */
export function ultimosDias(n = 7) {
  const dias = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push({
      date: d.toLocaleDateString('en-CA', { timeZone: TZ_BR }),
      label: d.toLocaleDateString('pt-BR', { timeZone: TZ_BR, day: '2-digit', month: '2-digit' }),
    });
  }
  return dias;
}
