// ===== CONSULTAR HORÁRIOS DISPONÍVEIS =====
// Ctrl+F "CONSULTAR HORÁRIOS DISPONÍVEIS" para achar este bloco.
// US "Seleção de Data e Horário" (item 2.48): os horários em que o serviço cabe
// no expediente da barbearia e o profissional está livre, no dia escolhido.
import { apiFetch } from '../api';
import type { HorariosDisponiveis } from '@/types/agendamento';

export function consultarHorariosDisponiveis(
  servicoId: number,
  profissionalId: number,
  data: string,
) {
  const parametros = `servicoId=${servicoId}&profissionalId=${profissionalId}&data=${data}`;
  return apiFetch<HorariosDisponiveis>(`/meus-agendamentos/horarios-disponiveis?${parametros}`);
}
