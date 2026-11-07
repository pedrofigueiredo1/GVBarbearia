// Horário de atendimento da barbearia, usado pelo calendário para sombrear os
// horários fechados. É o mesmo horário que o backend usa para aceitar
// agendamentos do app (backend/src/agendamentos/horario-atendimento.ts).

export type Periodo = [inicio: number, fim: number]; // minutos desde 00:00

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

// A barbearia está aberta nesse minuto (desde 00:00) do dia da semana?
export function estaAberto(diaDaSemana: number, minuto: number) {
  return EXPEDIENTE[diaDaSemana].some(([inicio, fim]) => minuto >= inicio && minuto < fim);
}

// Trechos de horas (minutos desde 00:00, sempre em horas cheias) que o quadro do
// calendário mostra: só as horas em que a barbearia abre em algum dos dias
// exibidos, mais as de agendamentos que já existem fora do expediente (marcados
// antes desta regra), para nenhum ficar escondido. As horas fechadas ficam de fora.
export function trechosDoQuadro(diasDaSemana: number[], extras: Periodo[] = []): Periodo[] {
  const brutos: Periodo[] = [...extras];
  for (const dia of new Set(diasDaSemana)) brutos.push(...EXPEDIENTE[dia]);

  const ordenados = brutos
    .map(([inicio, fim]): Periodo => [Math.floor(inicio / 60) * 60, Math.ceil(fim / 60) * 60])
    .sort((a, b) => a[0] - b[0]);

  const juntos: Periodo[] = [];
  for (const [inicio, fim] of ordenados) {
    const ultimo = juntos[juntos.length - 1];
    if (ultimo && inicio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fim);
    else juntos.push([inicio, fim]);
  }
  return juntos;
}

// Partes de `trecho` em que a barbearia está fechada num dia da semana (usado
// na visão da semana, em que os dias não abrem nos mesmos horários).
export function partesFechadas(diaDaSemana: number, trecho: Periodo): Periodo[] {
  const fechadas: Periodo[] = [];
  let cursor = trecho[0];
  for (const [inicio, fim] of EXPEDIENTE[diaDaSemana]) {
    if (fim <= cursor || inicio >= trecho[1]) continue;
    if (inicio > cursor) fechadas.push([cursor, inicio]);
    cursor = Math.max(cursor, fim);
  }
  if (cursor < trecho[1]) fechadas.push([cursor, trecho[1]]);
  return fechadas;
}
