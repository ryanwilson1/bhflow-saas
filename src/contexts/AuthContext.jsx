// src/contexts/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
//  Contexto de autenticação — 100% Supabase Auth.
//  setUser removido da API pública: apenas o Supabase
//  controla quem está autenticado.
// ─────────────────────────────────────────────────────────────
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getUser, login, logout, onAuthChange, signUp } from '@/services/authService';
import { SUPABASE_CONFIGURED } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega sessão existente
    getUser().then(u => {
      setUser(u);
      setLoading(false);
    });

    // Escuta mudanças de sessão (login, logout, token refresh)
    const unsubscribe = onAuthChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    configured: SUPABASE_CONFIGURED,
    login:  useCallback((email, password) => login(email, password), []),
    signUp: useCallback((email, password) => signUp(email, password), []),
    logout: useCallback(async () => {
      await logout();
      setUser(null);
    }, []),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
