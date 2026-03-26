// src/pages/Candidatos.jsx
import { useMemo, useState } from 'react';
import { PIPELINE_STAGES, STAGE_MAP } from '@/utils/constants';
import { formatTimestampBR } from '@/utils/dates';
import { formatarTelefone, whatsappLink } from '@/utils/helpers';
import { RegistroForm } from '@/components/ui/RegistroForm';
import { Button, EmptyState, PageHeader, Spinner, StageBadge } from '@/components/ui/index';
import { useToast } from '@/contexts/ToastContext';

function CandidatoRow({ r, onEdit, onDelete }) {
  const stage = STAGE_MAP[r.status] || STAGE_MAP['novo'];
  const tel   = (r.telefone || '').replace(/\D/g, '');
  return (
    <div
      style={{
        background: 'var(--surface)', borderRadius: 'var(--r-md)',
        padding: '14px 18px', border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        boxShadow: 'var(--sh-sm)', transition: 'box-shadow var(--t)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--sh-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--sh-sm)'}
    >
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        background: 'var(--blue-soft)', color: 'var(--blue)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 16, flexShrink: 0,
      }}>
        {(r.nome || '?')[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{r.nome}</div>
        <div style={{ fontSize: 12, color: 'var(--text-lt)', marginTop: 2 }}>
          {formatarTelefone(r.telefone)} · {r.origem} · {formatTimestampBR(r.data_cadastro)}
        </div>
        {r.observacoes && (
          <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 3 }}>
            {r.observacoes.slice(0, 90)}{r.observacoes.length > 90 ? '…' : ''}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <StageBadge stage={stage} />
        {tel && (
          <a href={whatsappLink(tel)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <Button size="sm" v="soft">💬 WhatsApp</Button>
          </a>
        )}
        <Button size="sm" v="ghost" onClick={onEdit} title="Editar">✏️</Button>
        <Button size="sm" v="danger" onClick={onDelete} title="Excluir">🗑️</Button>
      </div>
    </div>
  );
}

function ConfirmDelete({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(14,28,47,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div className="slide" style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        padding: 28, boxShadow: 'var(--sh-xl)', maxWidth: 360, width: '100%',
      }}>
        <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>Confirmar exclusão</p>
        <p style={{ color: 'var(--text-mid)', fontSize: 13, marginBottom: 24 }}>
          Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button v="ghost" onClick={onCancel}>Cancelar</Button>
          <Button v="danger" onClick={onConfirm}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}

export default function Candidatos({ registros, loading, inserir, atualizar, excluir }) {
  const toast = useToast();
  const [busca,     setBusca]     = useState('');
  const [fStatus,   setFStatus]   = useState('');
  const [fOrigem,   setFOrigem]   = useState('');
  const [editando,  setEditando]  = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const origens = useMemo(
    () => [...new Set(registros.map(r => r.origem).filter(Boolean))].sort(),
    [registros]
  );

  const filtrados = useMemo(() => registros.filter(r => {
    const txt = `${r.nome} ${r.telefone} ${r.origem} ${r.observacoes || ''}`.toLowerCase();
    if (busca   && !txt.includes(busca.toLowerCase())) return false;
    if (fStatus && r.status !== fStatus)               return false;
    if (fOrigem && r.origem !== fOrigem)               return false;
    return true;
  }), [registros, busca, fStatus, fOrigem]);

  const handleSave = async payload => {
    const result = editando?.id
      ? await atualizar(editando.id, payload)
      : await inserir(payload);
    if (result.error) { toast('Erro ao salvar: ' + result.error, 'error'); return result; }
    toast(editando?.id ? 'Candidato atualizado!' : 'Candidato cadastrado!', 'success');
    setEditando(null);
    return result;
  };

  const handleExcluir = async () => {
    const { error } = await excluir(confirmId);
    if (error) toast('Erro ao excluir: ' + error, 'error');
    else toast('Candidato removido.', 'success');
    setConfirmId(null);
  };

  const selStyle = {
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
    padding: '9px 12px', fontSize: 13, fontFamily: 'inherit',
    background: 'var(--surface)', cursor: 'pointer', outline: 'none', color: 'var(--text)',
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }} className="fade">
      <PageHeader
        title="Candidatos"
        subtitle={`${filtrados.length} resultado(s)`}
        action={<Button onClick={() => setEditando({})}>+ Cadastrar</Button>}
      />

      {/* Filtros */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap',
        background: 'var(--surface)', padding: '12px 16px',
        borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)',
      }}>
        <input
          value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar nome, telefone, origem…"
          style={{ flex: 1, minWidth: 200, ...selStyle }}
        />
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={selStyle}>
          <option value="">Todos os status</option>
          {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={fOrigem} onChange={e => setFOrigem(e.target.value)} style={selStyle}>
          <option value="">Todas as origens</option>
          {origens.map(o => <option key={o}>{o}</option>)}
        </select>
        {(busca || fStatus || fOrigem) && (
          <Button v="ghost" size="sm" onClick={() => { setBusca(''); setFStatus(''); setFOrigem(''); }}>
            ✕ Limpar
          </Button>
        )}
      </div>

      {filtrados.length === 0
        ? <EmptyState icon="🔍" title="Nenhum resultado" subtitle="Tente ajustar os filtros" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtrados.map(r => (
              <CandidatoRow
                key={r.id} r={r}
                onEdit={() => setEditando(r)}
                onDelete={() => setConfirmId(r.id)}
              />
            ))}
          </div>
        )
      }

      <RegistroForm
        open={Boolean(editando)}
        onClose={() => setEditando(null)}
        onSave={handleSave}
        inicial={editando?.id ? editando : null}
      />

      <ConfirmDelete
        open={Boolean(confirmId)}
        onConfirm={handleExcluir}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
