import { SEM_FILTROS } from './compartilhado';

// 'AAAA-MM-DD' (valor do input de data) -> 'DD/MM/AAAA', sem passar por Date
// para não sofrer deslocamento de fuso.
function formatarData(valor: string) {
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Monta as linhas "Filtros:" do cabeçalho do PDF a partir do que o
// administrador preencheu na tela no momento de gerar o relatório.
export function descreverFiltros(
  dataInicio: string,
  dataFim: string,
  extras: [string, string | undefined][] = [],
  rotuloPeriodo = 'Período',
) {
  const descricao: string[] = [];

  if (dataInicio && dataFim) {
    descricao.push(`${rotuloPeriodo}: ${formatarData(dataInicio)} a ${formatarData(dataFim)}`);
  } else if (dataInicio) {
    descricao.push(`${rotuloPeriodo}: a partir de ${formatarData(dataInicio)}`);
  } else if (dataFim) {
    descricao.push(`${rotuloPeriodo}: até ${formatarData(dataFim)}`);
  }

  for (const [rotulo, valor] of extras) {
    if (valor) descricao.push(`${rotulo}: ${valor}`);
  }

  return descricao.length > 0 ? descricao : [SEM_FILTROS];
}
