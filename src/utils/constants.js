// src/utils/constants.js
export const PIPELINE_STAGES = [
  { id: 'novo',          label: 'Novo',                   color: '#2563EB', bg: '#EBF3FF' },
  { id: 'atendimento',   label: 'Em atendimento',         color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'sem_interesse', label: 'Sem interesse',          color: '#D97706', bg: '#FFFBEB' },
  { id: 'reuniao',       label: 'Participou de reunião',  color: '#0891B2', bg: '#ECFEFF' },
  { id: 'em_processo',   label: 'Em processo',            color: '#EA580C', bg: '#FFF7ED' },
  { id: 'aprovado',      label: 'Aprovado / Credenciado', color: '#059669', bg: '#ECFDF5' },
  { id: 'recusado',      label: 'Recusado',               color: '#DC2626', bg: '#FEF2F2' },
];

export const STAGE_MAP = Object.fromEntries(
  PIPELINE_STAGES.map(s => [s.id, s])
);

export const ORIGENS_PADRAO = [
  'InfoJobs', 'Catho', 'CRECI', 'Indicação',
  'Redes sociais', 'LinkedIn', 'Site próprio', 'Outros',
];

export const TZ_BR = 'America/Sao_Paulo';
