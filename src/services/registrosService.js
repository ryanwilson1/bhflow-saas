// src/services/registrosService.js
// ─────────────────────────────────────────────────────────────
//  CRUD de registros (candidatos) — exclusivamente via Supabase.
//  Sem localStorage como banco de dados.
//  Sem dados simulados. Sem fallback local.
//  Isolamento multi-tenant garantido pelo RLS do Supabase.
// ─────────────────────────────────────────────────────────────
import { supabase, erroNaoConfigurado } from '@/lib/supabase';

const TABLE = 'registros';

/**
 * Busca todos os registros do usuário autenticado.
 * O RLS do Supabase filtra automaticamente por user_id.
 */
export async function getRegistros() {
  if (!supabase) return { data: [], error: erroNaoConfigurado().message };
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('data_cadastro', { ascending: false });
    if (error) throw error;
    return { data: data ?? [], error: null };
  } catch (e) {
    console.error('[BHFlow:registros] getRegistros:', e.message);
    return { data: [], error: e.message };
  }
}

/**
 * Insere um novo registro.
 * O trigger fn_set_user_id injeta user_id automaticamente no banco.
 */
export async function insertRegistro(payload) {
  if (!supabase) return { data: null, error: erroNaoConfigurado().message };
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error('[BHFlow:registros] insertRegistro:', e.message);
    return { data: null, error: e.message };
  }
}

/** Atualiza campos de um registro existente. */
export async function updateRegistro(id, payload) {
  if (!supabase) return { data: null, error: erroNaoConfigurado().message };
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error('[BHFlow:registros] updateRegistro:', e.message);
    return { data: null, error: e.message };
  }
}

/** Remove um registro. */
export async function deleteRegistro(id) {
  if (!supabase) return { error: erroNaoConfigurado().message };
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (e) {
    console.error('[BHFlow:registros] deleteRegistro:', e.message);
    return { error: e.message };
  }
}
