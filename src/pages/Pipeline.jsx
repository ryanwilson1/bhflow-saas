// src/pages/Pipeline.jsx
import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { RegistroForm } from '@/components/ui/RegistroForm';
import { PageHeader, Spinner } from '@/components/ui/index';
import { useToast } from '@/contexts/ToastContext';

export default function Pipeline({ registros, loading, mover, atualizar }) {
  const toast = useToast();
  const [editando, setEditando] = useState(null);

  const handleMover = async (id, novoStatus) => {
    const { error } = await mover(id, novoStatus);
    if (error) toast('Erro ao mover candidato: ' + error, 'error');
  };

  const handleSave = async payload => {
    const { error } = await atualizar(editando.id, payload);
    if (error) { toast('Erro ao salvar: ' + error, 'error'); return { error }; }
    toast('Candidato atualizado!', 'success');
    setEditando(null);
    return { error: null };
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>
  );

  return (
    <div className="fade">
      <PageHeader
        title="Pipeline Kanban"
        subtitle={`Arraste os cards para mover entre etapas · ${registros.length} candidato(s)`}
      />

      <KanbanBoard
        registros={registros}
        onMover={handleMover}
        onCardClick={r => setEditando(r)}
      />

      <RegistroForm
        open={Boolean(editando)}
        onClose={() => setEditando(null)}
        onSave={handleSave}
        inicial={editando}
      />
    </div>
  );
}
