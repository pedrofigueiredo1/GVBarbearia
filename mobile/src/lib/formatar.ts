// Formatadores de exibição (valores vêm do backend como texto/ISO).

// Datas e horas sempre no horário de Brasília, o da barbearia: os horários da
// grade (09:00, 09:30...) são os de lá, então um celular configurado em outro
// fuso mostraria uma hora diferente da que o cliente escolheu.
const FUSO_DA_BARBEARIA = 'America/Sao_Paulo';

export function formatarMoeda(valor: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
}

export function formatarDuracao(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO_DA_BARBEARIA });
}

export function formatarEstrelas(nota: number) {
  return '★'.repeat(nota) + '☆'.repeat(5 - nota);
}

// Dia de hoje na barbearia (não no celular), à meia-noite, para o calendário
// não oferecer o dia errado quando o aparelho está em outro fuso.
export function hojeNaBarbearia() {
  const [dia, mes, ano] = new Date()
    .toLocaleDateString('pt-BR', { timeZone: FUSO_DA_BARBEARIA })
    .split('/')
    .map(Number);
  return new Date(ano, mes - 1, dia);
}

export function formatarHora(iso: string | Date) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: FUSO_DA_BARBEARIA,
  });
}
