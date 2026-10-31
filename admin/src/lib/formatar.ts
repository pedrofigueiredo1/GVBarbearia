// Formatadores de exibição compartilhados pelas telas novas do painel.

export function formatarMoeda(valor: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(valor),
  );
}

// '2026-10-23T13:30:00.000Z' -> '10:30' (horário do navegador, o mesmo da barbearia).
export function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// '2026-10-23T13:30:00.000Z' -> '23/10/2026 10:30'
export function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// '2026-10-23' -> '23/10'
export function formatarDiaCurto(data: string) {
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
}
