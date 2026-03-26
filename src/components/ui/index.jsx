// src/components/ui/index.jsx — biblioteca de componentes B&H Flow
import { useEffect, useRef, useState } from 'react';

// ── Button ────────────────────────────────────────────────────
export function Button({ children, onClick, v = 'primary', size = 'md', disabled, type = 'button', style: s = {}, title, className = '' }) {
  const SZ = {
    sm: { fontSize: 12, padding: '6px 13px' },
    md: { fontSize: 13.5, padding: '10px 20px' },
    lg: { fontSize: 15, padding: '13px 28px' },
  };
  const VS = {
    primary: { background: 'var(--blue)',     color: '#fff', boxShadow: '0 2px 10px rgba(37,99,235,.25)' },
    gold:    { background: 'var(--gold)',      color: '#fff', boxShadow: '0 2px 10px rgba(196,150,42,.25)' },
    ghost:   { background: 'transparent',      color: 'var(--blue)', border: '1.5px solid var(--border)' },
    soft:    { background: 'var(--blue-soft)', color: 'var(--blue)' },
    danger:  { background: 'var(--red)',       color: '#fff' },
    dark:    { background: 'var(--navy)',      color: '#fff' },
    success: { background: 'var(--green)',     color: '#fff' },
    nav:     { background: 'transparent',      color: 'rgba(255,255,255,.6)', border: 'none' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none',
        borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1,
        transition: 'all var(--t)', whiteSpace: 'nowrap',
        ...SZ[size], ...VS[v], ...s,
      }}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = 'text', required, error, hint, onKeyDown, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>
          {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
        </label>
      )}
      <input
        type={type} value={value ?? ''} placeholder={placeholder} autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        style={{
          border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 'var(--r-sm)', padding: '10px 13px', fontSize: 14,
          color: 'var(--text)', background: 'var(--surface)', outline: 'none',
          transition: 'border var(--t)', fontFamily: 'inherit', width: '100%',
        }}
      />
      {hint  && !error && <span style={{ fontSize: 11, color: 'var(--text-lt)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>
          {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
        </label>
      )}
      <select value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{
          border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--r-sm)', padding: '10px 13px', fontSize: 14,
          color: 'var(--text)', background: 'var(--surface)', outline: 'none',
          fontFamily: 'inherit', cursor: 'pointer', width: '100%',
        }}>
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>{label}</label>}
      <textarea value={value ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
          padding: '10px 13px', fontSize: 14, color: 'var(--text)',
          fontFamily: 'inherit', resize: 'vertical', outline: 'none',
          lineHeight: 1.5, width: '100%',
        }}
      />
    </div>
  );
}

// ── StageBadge ────────────────────────────────────────────────
export function StageBadge({ stage }) {
  if (!stage) return null;
  return (
    <span style={{
      background: stage.bg, color: stage.color, border: `1px solid ${stage.color}35`,
      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {stage.label}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────
export function StatCard({ icon, value, label, color = 'var(--blue)', trend }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '20px 18px',
        border: '1.5px solid var(--border)',
        boxShadow: hov ? 'var(--sh-md)' : 'var(--sh-sm)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all .2s',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: trend >= 0 ? '#ECFDF5' : '#FEF2F2',
            color: trend >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, maxWidth = 540 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="fade"
      onClick={e => { if (e.target === ref.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(14,28,47,.52)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
      <div className="slide" style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        width: '100%', maxWidth, boxShadow: 'var(--sh-xl)', maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1.5px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)',
        }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'var(--surface-2)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-lt)',
          }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
        {footer && (
          <div style={{
            padding: '14px 24px', borderTop: '1.5px solid var(--border)',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            position: 'sticky', bottom: 0, background: 'var(--surface)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '3px solid var(--border)',
      borderTopColor: 'var(--blue)',
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
    }} />
  );
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      background: 'var(--surface)', borderRadius: 'var(--r-md)',
      border: '1.5px solid var(--border)',
    }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      {title    && <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{title}</p>}
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-lt)' }}>{subtitle}</p>}
      {action   && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 24, flexWrap: 'wrap', gap: 12,
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.02em', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && <p style={{ color: 'var(--text-lt)', fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
