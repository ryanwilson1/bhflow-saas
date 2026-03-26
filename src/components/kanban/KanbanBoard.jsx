// src/components/kanban/KanbanBoard.jsx
import { useState } from 'react';
import { PIPELINE_STAGES } from '@/utils/constants';
import { avatarColor, truncar, whatsappLink } from '@/utils/helpers';

function KanbanCard({ r, onDragStart, onClick }) {
  const [hov, setHov] = useState(false);
  const cor = avatarColor(r.nome);
  const tel = (r.telefone || '').replace(/\D/g, '');

  return (
    <div
      draggable
      onDragStart={() => onDragStart(r.id)}
      onClick={() => onClick(r)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', borderRadius: 11, padding: '12px 13px',
        border: '1.5px solid var(--border)', cursor: 'grab',
        boxShadow: hov ? 'var(--sh-md)' : 'var(--sh-sm)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all .18s', userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: cor,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 13,
        }}>
          {(r.nome || '?')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 13, color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {r.nome}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-lt)' }}>{r.origem}</div>
        </div>
      </div>

      {r.observacoes && (
        <div style={{ fontSize: 11.5, color: 'var(--text-mid)', marginBottom: 9, lineHeight: 1.4 }}>
          {truncar(r.observacoes, 65)}
        </div>
      )}

      {tel && (
        <a
          href={whatsappLink(tel)} target="_blank" rel="noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#F0FDF4', color: '#16A34A', borderRadius: 7,
            padding: '4px 9px', fontSize: 11, fontWeight: 600, textDecoration: 'none',
          }}
        >
          💬 WhatsApp
        </a>
      )}
    </div>
  );
}

function KanbanCol({ stage, cards, onDrop, onDragStart, onCardClick }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(stage.id); }}
      style={{
        minWidth: 210, maxWidth: 210, flexShrink: 0,
        borderRadius: 14, padding: 12,
        background: over ? stage.bg : 'var(--surface-2)',
        border: `2px solid ${over ? stage.color : 'transparent'}`,
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text)', flex: 1, lineHeight: 1.2 }}>
          {stage.label}
        </span>
        <span style={{
          borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
          background: stage.color + '22', color: stage.color,
        }}>
          {cards.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 48 }}>
        {cards.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '18px 0', fontSize: 12, color: 'var(--text-lt)',
            border: '2px dashed var(--border)', borderRadius: 10,
          }}>
            Arraste aqui
          </div>
        )}
        {cards.map(c => (
          <KanbanCard key={c.id} r={c} onDragStart={onDragStart} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ registros, onMover, onCardClick }) {
  const [dragging, setDragging] = useState(null);

  const grupos = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s.id] = registros.filter(r => (r.status || 'novo') === s.id);
    return acc;
  }, {});

  const drop = async stageId => {
    if (dragging) await onMover(dragging, stageId);
    setDragging(null);
  };

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
      {PIPELINE_STAGES.map(s => (
        <KanbanCol
          key={s.id} stage={s} cards={grupos[s.id] || []}
          onDragStart={setDragging} onDrop={drop} onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
