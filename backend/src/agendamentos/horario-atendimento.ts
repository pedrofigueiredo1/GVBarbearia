// ===== HORÁRIO DE ATENDIMENTO =====
// Ctrl+F "HORÁRIO DE ATENDIMENTO" para achar este bloco.
// Horário em que a barbearia atende e a grade de horários que o cliente pode
// escolher no app. Funções puras, sem banco, para serem usadas tanto na
// consulta dos horários livres quanto na validação do agendamento.
//
// Este é o horário real da barbearia (o mesmo do texto exibido em "Sobre"). Se
// mudar, mude aqui.

// Os horários da barbearia são os de Brasília. O Brasil não tem horário de
// verão desde 2019, então o fuso é fixo em UTC-3 e o resultado não depende do
// fuso do servidor (no deploy ele roda em UTC).
const FUSO_MINUTOS = -3 * 60;

// De quanto em quanto tempo começa um horário na grade (09:00, 09:30...).
export const INTERVALO_MINUTOS = 30;

type Periodo = [inicio: number, fim: number]; // minutos desde 00:00

const hora = (h: number, m = 0) => h * 60 + m;

const SEGUNDA_A_SEXTA: Periodo[] = [
  [hora(9), hora(13)],
  [hora(15), hora(21)],
];
const SABADO: Periodo[] = [
  [hora(8), hora(13)],
  [hora(14), hora(18)],
];

// 0 = domingo ... 6 = sábado. Domingo fechado.
const EXPEDIENTE: Periodo[][] = [
  [],
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SEGUNDA_A_SEXTA,
  SABADO,
];

const MS_POR_MINUTO = 60_000;

// Início (em UTC) do dia `data` ('AAAA-MM-DD') no horário de Brasília.
function inicioDoDia(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia) - FUSO_MINUTOS * MS_POR_MINUTO;
}

// Início e fim (em UTC) do dia `data` ('AAAA-MM-DD') no horário de Brasília.
export function limitesDoDia(data: string) {
  const inicio = inicioDoDia(data);
  return {
    inicio: new Date(inicio),
    fim: new Date(inicio + 24 * 60 * MS_POR_MINUTO),
  };
}

// Data ('AAAA-MM-DD') e hora ('HH:MM') de um instante, no horário de Brasília.
export function dataEHoraLocais(instante: Date) {
  const local = new Date(instante.getTime() + FUSO_MINUTOS * MS_POR_MINUTO);
  const iso = local.toISOString();
  return { data: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

// Horários em que um serviço de `duracaoMinutos` pode COMEÇAR no dia `data`:
// o atendimento precisa terminar até o fim do período em que começou.
export function horariosDoDia(data: string, duracaoMinutos: number): Date[] {
  const [ano, mes, dia] = data.split('-').map(Number);
  const diaDaSemana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
  const base = inicioDoDia(data);

  const horarios: Date[] = [];
  for (const [inicio, fim] of EXPEDIENTE[diaDaSemana]) {
    for (let t = inicio; t + duracaoMinutos <= fim; t += INTERVALO_MINUTOS) {
      horarios.push(new Date(base + t * MS_POR_MINUTO));
    }
  }
  return horarios;
}

// Confere se `dataHora` é um dos horários da grade para esse serviço.
export function estaNaGrade(dataHora: Date, duracaoMinutos: number) {
  const { data } = dataEHoraLocais(dataHora);
  return horariosDoDia(data, duracaoMinutos).some(
    (h) => h.getTime() === dataHora.getTime(),
  );
}
