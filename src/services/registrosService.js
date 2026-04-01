export async function updateRegistro(id, payload) {
  alert(`ID RECEBIDO: ${id}\nPAYLOAD: ${JSON.stringify(payload)}`);

  if (!supabase) {
    return { data: null, error: erroNaoConfigurado().message };
  }

  try {
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