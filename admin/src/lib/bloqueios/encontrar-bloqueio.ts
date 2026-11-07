// Bloqueio que vale para um barbeiro num dia (o dele ou um geral, de feriado),
// sem ir à API: usado para avisar no formulário e sombrear o calendário. A
// regra de verdade é a da API, que recusa o agendamento de qualquer jeito.
import type { BloqueioAgenda } from '@/types/bloqueio';

export function encontrarBloqueio(
  bloqueios: BloqueioAgenda[],
  profissionalId: number | null,
  data: string,
) {
  return bloqueios.find(
    (b) =>
      b.dataInicio <= data &&
      data <= b.dataFim &&
      (b.profissionalId === null || b.profissionalId === profissionalId),
  );
}
