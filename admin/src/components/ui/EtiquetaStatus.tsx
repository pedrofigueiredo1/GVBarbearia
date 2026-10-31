import { STATUS_LABEL, type StatusAgendamento } from '@/types/agendamento';

const ESTILO: Record<StatusAgendamento, string> = {
  PENDENTE: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  CONFIRMADO: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  CONCLUIDO: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  CANCELADO: 'bg-red-400/15 text-red-300 border-red-400/30',
};

// Etiqueta colorida com a situação do agendamento.
export function EtiquetaStatus({ status }: { status: StatusAgendamento }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${ESTILO[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
