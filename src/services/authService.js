// src/services/authService.js
// ─────────────────────────────────────────────────────────────
//  Serviço de autenticação — 100% Supabase Auth.
//  Sem modo demo, sem mock de usuário, sem fallback local.
// ─────────────────────────────────────────────────────────────
import { supabase, erroNaoConfigurado } from '@/lib/supabase';

/** Retorna o usuário autenticado da sessão ativa, ou null. */
export async function getUser() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session?.user ?? null;
  } catch (e) {
    console.error('[BHFlow:auth] getUser:', e.message);
    return null;
  }
}

/** Login com e-mail e senha via Supabase Auth. */
export async function login(email, password) {
  if (!supabase) return { data: null, error: erroNaoConfigurado() };
  try {
    return await supabase.auth.signInWithPassword({ email, password });
  } catch (e) {
    console.error('[BHFlow:auth] login:', e.message);
    return { data: null, error: { message: e.message } };
  }
}

/** Cadastro de novo usuário via Supabase Auth. */
export async function signUp(email, password) {
  if (!supabase) return { data: null, error: erroNaoConfigurado() };
  try {
    return await supabase.auth.signUp({ email, password });
  } catch (e) {
    console.error('[BHFlow:auth] signUp:', e.message);
    return { data: null, error: { message: e.message } };
  }
}

/** Encerra a sessão do usuário. */
export async function logout() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('[BHFlow:auth] logout:', e.message);
  }
}

/**
 * Escuta mudanças de sessão (login, logout, refresh de token).
 * Retorna função de cleanup para uso em useEffect.
 */
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(_event, session)
  );
  return () => subscription.unsubscribe();
}
