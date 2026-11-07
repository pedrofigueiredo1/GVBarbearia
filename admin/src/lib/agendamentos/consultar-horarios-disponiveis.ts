// ===== CONSULTAR HORÁRIOS DISPONÍVEIS =====
// Ctrl+F "CONSULTAR HORÁRIOS DISPONÍVEIS" para achar este bloco.
// Os horários em que a barbearia está aberta e o barbeiro está livre num dia,
// para o formulário de agendamento mostrar só esses. `agendamentoId` é o
// agendamento que está sendo remarcado (o horário dele conta como livre).
import { apiFetch } from '../api';
import { montarQuery } from '../relatorios/montar-query';
import type { HorariosDisponiveis } from '@/types/agendamento';

export function consultarHorariosDisponiveis(parametros: {
  servicoId: number;
  profissionalId: number;
  data: string;
  clienteId?: number;
  agendamentoId?: number;
}) {
  return apiFetch<HorariosDisponiveis>(`/agendamentos/horarios-disponiveis${montarQuery(parametros)}`);
}
