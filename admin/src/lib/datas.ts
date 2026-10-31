// Datas no horário do navegador (o mesmo da barbearia), no formato AAAA-MM-DD.
// Usadas pelo calendário e pelos filtros de período.

const dois = (n: number) => String(n).padStart(2, '0');

export function paraData(d: Date) {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export function hojeLocal() {
  return paraData(new Date());
}

// '2026-10-23' -> Date à meia-noite local.
export function dataDe(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function somarDias(data: string, dias: number) {
  const d = dataDe(data);
  d.setDate(d.getDate() + dias);
  return paraData(d);
}

// Segunda-feira da semana da data.
export function segundaDaSemana(data: string) {
  const d = dataDe(data);
  const deslocamento = (d.getDay() + 6) % 7; // segunda = 0
  d.setDate(d.getDate() - deslocamento);
  return paraData(d);
}

// Instante (ISO, UTC) de uma data e hora locais.
export function paraIsoLocal(data: string, hora: string) {
  return new Date(`${data}T${hora}`).toISOString();
}

// Início e fim (ISO) de um intervalo de dias locais, fim exclusivo.
export function limitesDosDias(inicio: string, fimExclusivo: string) {
  return {
    dataInicio: dataDe(inicio).toISOString(),
    dataFim: new Date(dataDe(fimExclusivo).getTime() - 1).toISOString(),
  };
}

export const DIAS_SEMANA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DIAS_SEMANA_LONGO = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function formatarDiaMes(data: string) {
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
}
