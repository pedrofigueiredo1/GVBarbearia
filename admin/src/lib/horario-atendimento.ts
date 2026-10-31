// Horário de atendimento da barbearia, usado pelo calendário para sombrear os
// horários fechados. É o mesmo horário que o backend usa para aceitar
// agendamentos do app (backend/src/agendamentos/horario-atendimento.ts).

type Periodo = [inicio: number, fim: number]; // minutos desde 00:00

const SEGUNDA_A_SEXTA: Periodo[] = [
  [9 * 60, 13 * 60],
  [15 * 60, 21 * 60],
];
const SABADO: Periodo[] = [
  [8 * 60, 13 * 60],
  [14 * 60, 18 * 60],
];

// 0 = domingo ... 6 = sábado.
export const EXPEDIENTE: Periodo[][] = [
  [],
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SABADO,
];

// Faixa de horas que o calendário mostra (cobre o expediente de todos os dias).
export const HORA_INICIAL = 8;
export const HORA_FINAL = 21;

// Trechos FECHADOS dentro da faixa do calendário num dia da semana.
export function trechosFechados(
  diaDaSemana: number,
  horaInicial: number = HORA_INICIAL,
  horaFinal: number = HORA_FINAL,
): Periodo[] {
  const inicioGrade = horaInicial * 60;
  const fimGrade = horaFinal * 60;
  const abertos = EXPEDIENTE[diaDaSemana];
  if (abertos.length === 0) return [[inicioGrade, fimGrade]];

  const fechados: Periodo[] = [];
  let cursor = inicioGrade;
  for (const [ini, fim] of abertos) {
    if (ini > cursor) fechados.push([cursor, ini]);
    cursor = Math.max(cursor, fim);
  }
  if (cursor < fimGrade) fechados.push([cursor, fimGrade]);
  return fechados;
}
