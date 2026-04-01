import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { RegistroForm } from '@/components/ui/RegistroForm';
import { Spinner } from '@/components/ui/index';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Pipeline from '@/pages/Pipeline';
import Candidatos from '@/pages/Candidatos';
import Relatorio from '@/pages/Relatorio';
import { useRegistros } from '@/hooks/useRegistros';
import { useToast } from '@/contexts/ToastContext';

function BannerErro({ mensagem }) {
  return (
    <div
      style={{
        background: '#FEF2F2',
        border: '1.5px solid #FCA5A5',
        borderRadius: 10,
        padding: '14px 18px',
        margin: '0 0 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>

      <div style={{ color: '#991B1B' }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>
          Erro ao carregar dados do Supabase
        </strong>

        <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
          {mensagem}
        </span>
      </div>
    </div>
  );
}

function AuthenticatedLayout() {
  const toast = useToast();
  const [novoOpen, setNovoOpen] = useState(false);

  const {
    registros,
    loading,
    error,
    daSemana,
    inserir,
    atualizar,
    mover,
    excluir,
  } = useRegistros();

  const handleInserir = async payload => {
    const result = await inserir(payload);

    if (result.error) {
      toast('Erro ao cadastrar: ' + result.error, 'error');
    } else {
      toast('Candidato cadastrado com sucesso!', 'success');
    }

    return result;
  };

  return (
    <AppShell onNovo={() => setNovoOpen(true)}>
      {error && <BannerErro mensagem={error} />}

      <Routes>
        <Route
          index
          element={
            <Dashboard
              registros={registros}
              loading={loading}
              daSemana={daSemana}
              onNovo={() => setNovoOpen(true)}
            />
          }
        />

        <Route
          path="pipeline"
          element={
            <Pipeline
              registros={registros}
              loading={loading}
              mover={mover}
              atualizar={atualizar}
            />
          }
        />

        <Route
          path="candidatos"
          element={
            <Candidatos
              registros={registros}
              loading={loading}
              inserir={inserir}
              atualizar={atualizar}
              excluir={excluir}
            />
          }
        />

        <Route
          path="relatorio"
          element={<Relatorio registros={registros} loading={loading} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <RegistroForm
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onSave={handleInserir}
      />
    </AppShell>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <Spinner size={44} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user && window.location.pathname !== '/reset-password') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}