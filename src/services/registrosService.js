import { supabase, erroNaoConfigurado } from '@/lib/supabase';

const TABLE = 'registros';

export async function getRegistros() {
  if (!supabase) {
    return { data: [], error: erroNaoConfigurado().message };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error) throw error;

    return { data: data ?? [], error: null };
  } catch (e) {
    console.error('[BHFlow:registros] getRegistros:', e);
    return { data: [], error: e.message };
  }
}

export async function insertRegistro(payload) {
  if (!supabase) {
    return { data: null, error: erroNaoConfigurado().message };
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError) {
      console.error('[BHFlow] erro ao buscar usuário:', authError);
      throw authError;
    }

    const user = authData?.user;

    console.log('[BHFlow] usuário logado:', user);
    console.log('[BHFlow] payload recebido:', payload);

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[BHFlow] erro insert:', error);
      throw error;
    }

    return { data, error: null };
  } catch (e) {
    console.error('[BHFlow:registros] insertRegistro:', e);
    return {
      data: null,
      error: e?.message || 'Erro ao salvar registro',
    };
  }
}

export async function updateRegistro(id, payload) {
  if (!supabase) {
    return { data: null, error: erroNaoConfigurado().message };
  }

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
    console.error('[BHFlow:registros] updateRegistro:', e);
    return { data: null, error: e.message };
  }
}

export async function deleteRegistro(id) {
  if (!supabase) {
    return { error: erroNaoConfigurado().message };
  }

  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (e) {
    console.error('[BHFlow:registros] deleteRegistro:', e);
    return { error: e.message };
  }
}