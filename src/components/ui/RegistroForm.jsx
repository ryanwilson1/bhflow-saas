// src/components/ui/RegistroForm.jsx
import { useEffect, useState } from 'react';
import { ORIGENS_PADRAO, PIPELINE_STAGES } from '@/utils/constants';
import { limparTelefone, validarTelefone } from '@/utils/helpers';
import { Button, Input, Modal, Select, Textarea } from './index';

const VAZIO = { nome: '', telefone: '', origem: 'Outros', status: 'novo', observacoes: '' };
const STATUS_OPTS = PIPELINE_STAGES.map(s => ({ value: s.id, label: s.label }));

export function RegistroForm({ open, onClose, onSave, inicial = null }) {
  const isEdit = Boolean(inicial?.id);
  const [form,    setForm]    = useState(VAZIO);
  const [erros,   setErros]   = useState({});
  const [saving,  setSaving]  = useState(false);
  const [novaOrg, setNovaOrg] = useState('');
  const [origens, setOrigens] = useState(ORIGENS_PADRAO.map(o => ({ value: o, label: o })));

  useEffect(() => {
    if (open) {
      setForm(inicial ? { ...VAZIO, ...inicial } : VAZIO);
      setErros({});
      setNovaOrg('');
    }
  }, [open, inicial]);

  const set = field => value => setForm(p => ({ ...p, [field]: value }));

  const addOrigem = () => {
    const t = novaOrg.trim();
    if (!t || origens.find(o => o.value === t)) return;
    setOrigens(p => [...p, { value: t, label: t }]);
    set('origem')(t);
    setNovaOrg('');
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim())     e.nome     = 'Nome é obrigatório';
    if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório';
    else if (!validarTelefone(form.telefone)) e.telefone = 'Mínimo 10 dígitos com DDD';
    return e;
  };

  const submit = async () => {
    const e = validar();
    if (Object.keys(e).length) { setErros(e); return; }
    setSaving(true);
    const r = await onSave({ ...form, telefone: limparTelefone(form.telefone) });
    setSaving(false);
    if (!r?.error) onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title={isEdit ? '✏️ Editar candidato' : '➕ Novo candidato'}
      footer={
        <>
          <Button v="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? '💾 Salvar' : '➕ Cadastrar'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Nome completo" required autoFocus
          value={form.nome} onChange={set('nome')}
          placeholder="Ex: Maria Silva" error={erros.nome}
        />
        <Input
          label="Telefone (WhatsApp)" required type="tel"
          value={form.telefone} onChange={set('telefone')}
          placeholder="11999990000" error={erros.telefone}
          hint="Com DDD, somente números"
        />
        <div>
          <Select
            label="Origem" required
            value={form.origem} onChange={set('origem')}
            options={origens}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={novaOrg} onChange={e => setNovaOrg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addOrigem(); }}
              placeholder="+ Nova origem…"
              style={{
                flex: 1, border: '1.5px solid var(--border)', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <Button size="sm" v="soft" onClick={addOrigem}>Adicionar</Button>
          </div>
        </div>
        <Select
          label="Estágio no pipeline"
          value={form.status} onChange={set('status')}
          options={STATUS_OPTS}
        />
        <Textarea
          label="Observações"
          value={form.observacoes} onChange={set('observacoes')}
          placeholder="Notas, próximos passos…"
        />
      </div>
    </Modal>
  );
}
