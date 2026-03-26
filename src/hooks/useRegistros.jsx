// src/hooks/useRegistros.jsx
// ─────────────────────────────────────────────────────────────
//  Hook de estado para registros — conectado ao Supabase real.
//  Sem dados simulados. Sem localStorage. Sem fallback local.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteRegistro,
  getRegistros,
  insertRegistro,
  updateRegistro,
} from '@/services/registrosService';
import { inicioDaSemana } from '@/utils/dates';

export function useRegistros() {
  const [registros, setRegistros] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /** Carrega os registros do Supabase */
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await getRegistros();
    if (e) {
      setError(e);
      setRegistros([]);
    } else {
      setRegistros(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  /** Insere e atualiza estado local reativamente */
  const inserir = useCallback(async payload => {
    const { data, error: e } = await insertRegistro(payload);
    if (!e && data) setRegistros(prev => [data, ...prev]);
    return { data, error: e };
  }, []);

  /** Atualiza e reflete no estado local */
  const atualizar = useCallback(async (id, payload) => {
    const { data, error: e } = await updateRegistro(id, payload);
    if (!e && data) setRegistros(prev => prev.map(r => r.id === id ? data : r));
    return { data, error: e };
  }, []);

  /**
   * Move candidato de etapa — atualização otimista.
   * Reverte para o estado real se a API retornar erro.
   */
  const mover = useCallback(async (id, status) => {
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const { error: e } = await updateRegistro(id, { status });
    if (e) {
      await fetch(); // reverte para estado real do banco
      return { error: e };
    }
    return { error: null };
  }, [fetch]);

  /** Exclui e remove do estado local */
  const excluir = useCallback(async id => {
    const { error: e } = await deleteRegistro(id);
    if (!e) setRegistros(prev => prev.filter(r => r.id !== id));
    return { error: e };
  }, []);

  /** Candidatos cadastrados na semana atual */
  const daSemana = useMemo(() => {
    const inicio = inicioDaSemana();
    return registros.filter(r => {
      const d = r.data_cadastro ? new Date(r.data_cadastro) : null;
      return d && d >= inicio;
    });
  }, [registros]);

  /** Mapa de registros agrupados por status */
  const porStatus = useMemo(() =>
    registros.reduce((acc, r) => {
      const k = r.status || 'novo';
      (acc[k] ??= []).push(r);
      return acc;
    }, {}),
  [registros]);

  return {
    registros,
    loading,
    error,
    refetch: fetch,
    inserir,
    atualizar,
    mover,
    excluir,
    daSemana,
    porStatus,
  };
}
