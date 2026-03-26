// src/pages/Auth.jsx
// ─────────────────────────────────────────────────────────────
//  Tela de autenticação — login e cadastro via Supabase Auth.
//  Sem modo demo, sem auto-login, sem fallback.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width="46" height="46" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#auth-lg)" />
        <path d="M10 8h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-4l6 8H18l-6-8H12v8h-2V8z" fill="#fff" opacity=".95" />
        <path d="M12 8h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-8V8z" fill="#C4962A" opacity=".85" />
        <path d="M8 26c4-2 10-2 16 0" stroke="#C4962A" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
        <defs>
          <linearGradient id="auth-lg" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#1F3A5F" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--navy)', letterSpacing: '-.01em' }}>
          B&H <span style={{ color: 'var(--gold)' }}>Flow</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-lt)' }}>CRM de Recrutamento</div>
      </div>
    </div>
  );
}

/** Banner exibido quando Supabase não está configurado */
function BannerNaoConfigurado() {
  return (
    <div style={{
      background: '#FEF2F2',
      border: '1.5px solid #FCA5A5',
      borderRadius: 'var(--r-md)',
      padding: '14px 18px',
      fontSize: 13,
      color: '#991B1B',
      lineHeight: 1.6,
    }}>
      <strong style={{ display: 'block', marginBottom: 4 }}>⚠️ Supabase não configurado</strong>
      Para utilizar o sistema, configure as variáveis de ambiente no arquivo{' '}
      <code style={{ background: '#FEE2E2', padding: '1px 5px', borderRadius: 4 }}>.env</code>:
      <pre style={{
        background: '#FEE2E2', borderRadius: 6, padding: '10px 12px',
        marginTop: 8, fontSize: 12, fontFamily: 'var(--mono)', lineHeight: 1.6, overflowX: 'auto',
      }}>
        {'VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...'}
      </pre>
      Obtenha as credenciais em{' '}
      <a href="https://supabase.com" target="_blank" rel="noreferrer"
        style={{ color: '#DC2626', fontWeight: 700 }}>
        supabase.com
      </a>
      {' '}→ Project Settings → API.
    </div>
  );
}

export default function Auth() {
  const { login, signUp, configured } = useAuth();
  const toast = useToast();

  const [modo,    setModo]    = useState('login');
  const [email,   setEmail]   = useState('');
  const [senha,   setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');
  const [ok,      setOk]      = useState('');

  const submit = async () => {
    setErro(''); setOk('');

    if (!configured) {
      setErro('Supabase não configurado. Verifique o arquivo .env.');
      return;
    }
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);

    if (modo === 'login') {
      const { error } = await login(email, senha);
      if (error) setErro(error.message);
      else toast('Login realizado com sucesso!', 'success');
    } else {
      const { error } = await signUp(email, senha);
      if (error) setErro(error.message);
      else setOk('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    }

    setLoading(false);
  };

  const inp = {
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    color: 'var(--text)',
    width: '100%',
    background: 'var(--surface-2)',
    transition: 'border-color var(--t)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0E1C2F 0%, #1F3A5F 50%, #2563EB 100%)',
      fontFamily: 'var(--font)',
      padding: 16,
    }}>
      <div className="slide" style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-xl)',
        padding: '40px 36px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(14,28,47,.35)',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <Logo />

        {!configured && <BannerNaoConfigurado />}

        {/* Tabs login / cadastro */}
        <div style={{
          display: 'flex', background: 'var(--surface-2)',
          borderRadius: 'var(--r-md)', padding: 4,
        }}>
          {['login', 'signup'].map(m => (
            <button key={m}
              onClick={() => { setModo(m); setErro(''); setOk(''); }}
              style={{
                flex: 1, padding: '10px', border: 'none',
                fontWeight: 600, fontSize: 13.5,
                borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'inherit',
                background:   modo === m ? 'var(--surface)' : 'transparent',
                color:        modo === m ? 'var(--blue)' : 'var(--text-mid)',
                boxShadow:    modo === m ? 'var(--sh-sm)' : 'none',
                transition: 'all var(--t)',
              }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>E-mail</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              style={inp}
              disabled={!configured}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)' }}>Senha</label>
            <input
              type="password" value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••" style={inp}
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              disabled={!configured}
            />
          </div>
        </div>

        {/* Feedback */}
        {erro && (
          <div style={{
            background: '#FEF2F2', color: 'var(--red)',
            borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13,
          }}>
            {erro}
          </div>
        )}
        {ok && (
          <div style={{
            background: '#ECFDF5', color: 'var(--green)',
            borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13,
          }}>
            {ok}
          </div>
        )}

        {/* Botão de ação */}
        <button
          onClick={submit}
          disabled={loading || !configured}
          style={{
            background: configured ? 'var(--blue)' : 'var(--border)',
            color: configured ? '#fff' : 'var(--text-lt)',
            border: 'none', borderRadius: 'var(--r-md)', padding: '14px',
            fontWeight: 700, fontSize: 15,
            cursor: (loading || !configured) ? 'not-allowed' : 'pointer',
            opacity: loading ? .7 : 1,
            boxShadow: configured ? '0 4px 16px rgba(37,99,235,.32)' : 'none',
            fontFamily: 'inherit', transition: 'all var(--t)',
          }}>
          {loading ? 'Aguarde…' : modo === 'login' ? 'Entrar →' : 'Criar conta →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-lt)' }}>
          B&H Flow · SaaS de Recrutamento Profissional
        </p>
      </div>
    </div>
  );
}
