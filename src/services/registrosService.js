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
    console.error('[BHFlow:registros] getRegistros:', e.message);
    return { data: [], error: e.message };
  }
}

export async function insertRegistro(payload) {
  if (!supabase) {
    return { data: null, error: erroNaoConfigurado().message };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select();

    if (error) throw error;

    return { data: data?.[0] ?? null, error: null };
  } catch (e) {
    console.error('[BHFlow:registros] insertRegistro:', e.message);
    return { data: null, error: e.message };
  }
}

export async function updateRegistro(id, payload) {
  if (!supabase) {
    return { data: null, error: erroNaoConfigurado().message };
  }

  try {
    const teste = await supabase
      .from(TABLE)
      .select('id, nome')
      .eq('id', id);

    alert(
      `ANTES DO UPDATE:\n${JSON.stringify(teste.data)}\nERRO: ${JSON.stringify(teste.error)}`
    );

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select();

    alert(
      `UPDATE DATA: ${JSON.stringify(data)}\nUPDATE ERROR: ${JSON.stringify(error)}`
    );

    if (error) throw error;

    return { data: data?.[0] ?? null, error: null };
  } catch (e) {
    alert(`ERRO NO UPDATE: ${e.message}`);
    console.error('[BHFlow:registros] updateRegistro:', e.message);

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
    console.error('[BHFlow:registros] deleteRegistro:', e.message);
    return { error: e.message };
  }
}