import { EtiquetaStatus } from '@/components/ui/EtiquetaStatus';
import { formatarHora } from '@/lib/formatar';
import type { AgendamentoResumo } from '@/types/dashboard';

// Agenda do dia em ordem de horário: hora, cliente, serviço, barbeiro e situação.
export function AgendaDeHoje({ agenda }: { agenda: AgendamentoResumo[] }) {
  if (agenda.length === 0) {
    return <p className="text-sm text-white/50">Nenhum agendamento para hoje.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-borda">
      {agenda.map((agendamento) => (
        <li key={agendamento.id} className="flex items-center gap-4 py-3 first:pt-0">
          <span className="w-14 shrink-0 text-lg font-semibold text-copper">
            {formatarHora(agendamento.dataHora)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{agendamento.cliente.nome}</p>
            <p className="truncate text-xs text-white/60">
              {agendamento.servico.nome} · {agendamento.profissional.nome}
            </p>
          </div>
          <EtiquetaStatus status={agendamento.status} />
        </li>
      ))}
    </ul>
  );
}
