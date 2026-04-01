```jsx
// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const salvar = async () => {
    setErro('');
    setOk('');

    if (!senha || !confirmacao) {
      setErro('Preencha os dois campos.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setOk('Senha alterada com sucesso! Redirecionando...');

    setTimeout(() => {
      navigate('/login');
    }, 1800);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0E1C2F 0%, #1F3A5F 50%, #2563EB 100%)',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--surface)',
          borderRadius: 22,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,.28)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              color: 'var(--navy)',
              fontWeight: 800,
            }}
          >
            Nova senha
          </h1>

          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: 'var(--text-mid)',
              lineHeight: 1.5,
            }}
          >
            Digite sua nova senha para concluir a recuperação da conta.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmacao}
            onChange={e => setConfirmacao(e.target.value)}
            style={inputStyle}
            onKeyDown={e => {
              if (e.key === 'Enter') salvar();
            }}
          />
        </div>

        {erro && (
          <div
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              borderRadius: 10,
              padding: '12px 14px',
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
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 13,
            }}
          >
            {ok}
          </div>
        )}

        <button
          onClick={salvar}
          disabled={loading}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '14px',
            background: '#2563EB',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </div>
    </div>
  );
}
```
