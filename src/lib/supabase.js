// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
//  Cliente Supabase — ÚNICA fonte de dados do sistema.
//  Sem fallback, sem modo demo, sem localStorage como banco.
//
//  CONFIGURAÇÃO OBRIGATÓRIA (.env):
//    VITE_SUPABASE_URL=https://xxxx.supabase.co
//    VITE_SUPABASE_ANON_KEY=eyJ...
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SB_URL = import.meta.env.VITE_SUPABASE_URL  || '';
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** true = variáveis de ambiente presentes e válidas */
export const SUPABASE_CONFIGURED = Boolean(
  SB_URL && SB_URL.startsWith('https://') && SB_KEY && SB_KEY.length > 20
);

/**
 * Cliente Supabase.
 * Se as variáveis não estiverem configuradas, todas as chamadas
 * de serviço retornarão um erro descritivo — nunca dados falsos.
 */
export const supabase = SUPABASE_CONFIGURED
  ? createClient(SB_URL, SB_KEY, {
      auth: {
        persistSession:    true,
        autoRefreshToken:  true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Lança um erro padronizado quando Supabase não está configurado.
 * Usado pelos services para retornar resposta consistente.
 */
export function erroNaoConfigurado() {
  return {
    message: 'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
    code: 'SUPABASE_NOT_CONFIGURED',
  };
}
