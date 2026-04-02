import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const salvarNovaSenha = async () => {
    setErro('');
    setOk('');

    if (!senha || !confirmar) {
      setErro('Preencha os dois campos.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmar) {
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
    }, 2000);
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
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: '0 24px 64px rgba(14,28,47,.35)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            color: '#1F3A5F',
            textAlign: 'center',
          }}
        >
          Nova senha
        </h1>

        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 14,
            color: '#64748B',
          }}
        >
          Digite sua nova senha abaixo.
        </p>

        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          style={{
            border: '1.5px solid #D1D5DB',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 14,
            outline: 'none',
          }}
        />

        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmar}
          onChange={e => setConfirmar(e.target.value)}
          style={{
            border: '1.5px solid #D1D5DB',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 14,
            outline: 'none',
          }}
        />

        {erro && (
          <div
            style={{
              background: '#FEF2F2',
              color: '#B91C1C',
              padding: '12px 14px',
              borderRadius: 10,
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
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: 13,
            }}
          >
            {ok}
          </div>
        )}

        <button
          onClick={salvarNovaSenha}
          disabled={loading}
          style={{
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '14px',
            fontSize: 15,
            fontWeight: 700,
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