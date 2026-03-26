// src/components/layout/AppShell.jsx
// ─────────────────────────────────────────────────────────────
//  Layout principal do app autenticado.
//  Sem referências a modo demo ou localStorage.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function Logo({ mini = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: mini ? 8 : 10 }}>
      <svg width={mini ? 30 : 36} height={mini ? 30 : 36} viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#shell-lg)" />
        <path d="M10 8h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-4l6 8H18l-6-8H12v8h-2V8z" fill="#fff" opacity=".95" />
        <path d="M12 8h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-8V8z" fill="#C4962A" opacity=".85" />
        <path d="M8 26c4-2 10-2 16 0" stroke="#C4962A" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
        <defs>
          <linearGradient id="shell-lg" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#1F3A5F" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      {!mini && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1, letterSpacing: '-.01em' }}>
            B&H <span style={{ color: '#C4962A' }}>Flow</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', marginTop: 2 }}>
            CRM RECRUTAMENTO
          </div>
        </div>
      )}
    </div>
  );
}

const NAV = [
  { path: '/',           label: 'Dashboard',  icon: '📊' },
  { path: '/pipeline',   label: 'Pipeline',   icon: '🗂️'  },
  { path: '/candidatos', label: 'Candidatos', icon: '👥'  },
  { path: '/relatorio',  label: 'Relatório',  icon: '📄'  },
];

export function AppShell({ children, onNovo }) {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const [mob, setMob]    = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font)', background: 'var(--bg)' }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={`sidebar${mob ? ' open' : ''}`}
        style={{
          width: 230, flexShrink: 0, background: 'var(--navy-dark)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', zIndex: 200,
        }}
      >
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <Logo />
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map(item => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMob(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 'var(--r-sm)',
                  color:      active ? '#fff' : 'rgba(255,255,255,.6)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13.5,
                  background: active ? 'var(--blue)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--t)',
                }}
              >
                <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da sidebar — usuário e logout */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 8, wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.55)',
              border: 'none', borderRadius: 7, padding: '8px 12px',
              fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all var(--t)',
            }}
          >
            → Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {mob && (
        <div
          onClick={() => setMob(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 199 }}
        />
      )}

      {/* ── Main ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          className="topbar"
          style={{
            background: 'var(--surface)', borderBottom: '1.5px solid var(--border)',
            padding: '0 24px', height: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--sh-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="burger"
              onClick={() => setMob(true)}
              style={{
                background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
                color: 'var(--navy)', display: 'none', alignItems: 'center',
              }}
            >
              ☰
            </button>
            <div className="burger" style={{ display: 'none' }}>
              <Logo mini />
            </div>
          </div>

          <div className="hide-mobile" style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', letterSpacing: '-.01em' }}>
            B&H <span style={{ color: 'var(--gold)' }}>Flow</span>
          </div>

          <button
            onClick={onNovo}
            style={{
              background: 'var(--blue)', color: '#fff', border: 'none',
              borderRadius: 'var(--r-sm)', padding: '10px 20px',
              fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,.25)', fontFamily: 'inherit',
            }}
          >
            + Cadastrar
          </button>
        </header>

        <main style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
