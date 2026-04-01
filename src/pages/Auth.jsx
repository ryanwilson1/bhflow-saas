import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width="46" height="46" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#auth-lg)" />
        <path
          d="M10 8h10c3.3 0 6 2.7 6 6s-2.7 6-6 6h-4l6 8H18l-6-8H12v8h-2V8z"
          fill="#fff"
          opacity=".95"
        />
        <path
          d="M12 8h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-8V8z"
          fill="#C4962A"
          opacity=".85"
        />
        <path
          d="M8 26c4-2 10-2 16 0"
          stroke="#C4962A"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity=".7"
        />
        <defs>
          <linearGradient id="auth-lg" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#1F3A5F" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>

      <div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: 'var(--navy)',
            letterSpacing: '-.01em',
          }}
        >
          B&H <span style={{ color: 'var(--gold)' }}>Flow</span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-lt)' }}>
          CRM de Recrutamento
        </div>
      </div>
    </div>
  );
}

function BannerNaoConfigurado() {
  return (
    <div
      style={{
        background: '#FEF2F2',
        border: '1.5px solid #FCA5A5',
        borderRadius: 'var(--r-md)',
        padding: '14px 18px',
        fontSize: 13,
        color: '#991B1B',
        lineHeight: 1.6,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>
        ⚠️ Supabase não configurado
      </strong>

      Configure as variáveis no arquivo .env:

      <pre
        style={{
          background: '#FEE2E2',
          borderRadius: 6,
          padding: '10px 12px',
          marginTop: 8,
          fontSize: 12,
          overflowX: 'auto',
        }}
      >
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
      </pre>
    </div>
  );
}

export default function Auth() {
  const { login, signUp, configured } = useAuth();
  const toast = useToast();

  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');

  const submit = async () => {
    setErro('');
    setOk('');

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);

    if (modo === 'login') {
      const { error } = await login(email, senha);

      if (error) {
        setErro(error.message);
      } else {
        toast('Login realizado com sucesso!', 'success');
      }
    } else {
      const { error } = await signUp(email, senha);

      if (error) {
        setErro(error.message);
      } else {
        setOk('Conta criada! Verifique seu e-mail.');
      }
    }

    setLoading(false);
  };

  const recuperarSenha = async () => {
    setErro('');
    setOk('');

    if (!email.trim()) {
      setErro('Digite seu e-mail primeiro.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErro(error.message);
    } else {
      setOk('Enviamos um link de recuperação para seu e-mail.');
    }
  };

  const inp = {
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '12px 14px',
    fontSize: 14,
    width: '100%',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0E1C2F 0%, #1F3A5F 50%, #2563EB 100%)',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-xl)',
          padding: '40px 36px',
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <Logo />

        {!configured && <BannerNaoConfigurado />}

        <div
          style={{
            display: 'flex',
            background: 'var(--surface-2)',
            borderRadius: 'var(--r-md)',
            padding: 4,
          }}
        >
          <button
            onClick={() => setModo('login')}
            style={{
              flex: 1,
              padding: 10,
              border: 'none',
              borderRadius: 'var(--r-sm)',
              background: modo === 'login' ? 'var(--surface)' : 'transparent',
              color: modo === 'login' ? 'var(--blue)' : 'var(--text-mid)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Entrar
          </button>

          <button
            onClick={() => setModo('signup')}
            style={{
              flex: 1,
              padding: 10,
              border: 'none',
              borderRadius: 'var(--r-sm)',
              background: modo === 'signup' ? 'var(--surface)' : 'transparent',
              color: modo === 'signup' ? 'var(--blue)' : 'var(--text-mid)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Criar conta
          </button>
        </div>

        <input
          type="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inp}
        />

        <input
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') submit();
          }}
          style={inp}
        />

        {erro && (
          <div
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              fontSize: 13,
            }}
          >
            {erro}
          </div>
        )}

        {ok && (
          <div
            style={{
              background: '#ECFDF5',
              color: '#047857',
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              fontSize: 13,
            }}
          >
            {ok}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            background: 'var(--blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r-md)',
            padding: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {loading
            ? 'Aguarde...'
            : modo === 'login'
            ? 'Entrar →'
            : 'Criar conta →'}
        </button>

        {modo === 'login' && (
          <button
            type="button"
            onClick={recuperarSenha}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--blue)',
              fontSize: 13,
              cursor: 'pointer',
              marginTop: 8,
              display: 'block',
              width: '100%',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Esqueci minha senha
          </button>
        )}
      </div>
    </div>
  );
}