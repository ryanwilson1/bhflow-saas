export async function insertRegistro(payload) {
  if (!supabase) return { data: null, error: erroNaoConfigurado().message };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      

    console.log('INSERT DATA:', data);
    console.log('INSERT ERROR:', error);

    if (error) throw error;

    return { data: data?.[0] ?? null, error: null };
  } catch (e) {
    console.error('[BHFlow:registros] insertRegistro:', e.message);
    return { data: null, error: e.message };
  }
}

export async function updateRegistro(id, payload) {
  if (!supabase) return { data: null, error: erroNaoConfigurado().message };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      

    console.log('UPDATE DATA:', data);
    console.log('UPDATE ERROR:', error);

    if (error) throw error;

    return { data: data?.[0] ?? null, error: null };
  } catch (e) {
    console.error('[BHFlow:registros] updateRegistro:', e.message);
    return { data: null, error: e.message };
  }
}