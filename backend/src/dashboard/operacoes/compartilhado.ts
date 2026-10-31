// Datas usadas pelo dashboard. Todas as contas de "hoje", "ontem", "7 dias"
// etc. são feitas em dias do horário de Brasília (o mesmo da barbearia), e não
// no fuso do servidor, para o número do dashboard bater com o dia que a
// recepção enxerga.
import {
  dataEHoraLocais,
  limitesDoDia,
} from '../../agendamentos/horario-atendimento';

// Dia de hoje em Brasília, no formato AAAA-MM-DD.
export function hojeLocal(): string {
  return dataEHoraLocais(new Date()).data;
}

// Soma (ou subtrai) dias de uma data AAAA-MM-DD.
export function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias))
    .toISOString()
    .slice(0, 10);
}

// Primeiro dia do mês de uma data AAAA-MM-DD.
export function inicioDoMes(data: string): string {
  return `${data.slice(0, 8)}01`;
}

// Primeiro dia do mês anterior.
export function inicioDoMesAnterior(data: string): string {
  const [ano, mes] = data.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 2, 1)).toISOString().slice(0, 10);
}

// Quantidade de dias entre duas datas (fim exclusivo).
export function diasEntre(inicio: string, fimExclusivo: string): number {
  const ms = (d: string) => {
    const [ano, mes, dia] = d.split('-').map(Number);
    return Date.UTC(ano, mes - 1, dia);
  };
  return Math.round((ms(fimExclusivo) - ms(inicio)) / 86_400_000);
}

// Instante (UTC) em que começa o dia `data` em Brasília.
export function instanteDoDia(data: string): Date {
  return limitesDoDia(data).inicio;
}

// Dia (AAAA-MM-DD) em Brasília de um instante guardado em UTC.
export function diaLocalDe(instante: Date): string {
  return dataEHoraLocais(instante).data;
}
