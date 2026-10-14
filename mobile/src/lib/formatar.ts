// Formatadores de exibição (valores vêm do backend como texto/ISO).

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
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatarEstrelas(nota: number) {
  return '★'.repeat(nota) + '☆'.repeat(5 - nota);
}

export function formatarHora(iso: string | Date) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
