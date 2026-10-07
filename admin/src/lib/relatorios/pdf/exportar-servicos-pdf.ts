// ===== EXPORTAR SERVICOS MAIS AGENDADOS PDF =====
// Ctrl+F "EXPORTAR SERVICOS MAIS AGENDADOS PDF" para achar este bloco.
import type { ServicoMaisAgendado } from '@/types/relatorio';
import { adicionarResumo, adicionarSubtitulo, adicionarTabela, criarDocumento, finalizar } from './compartilhado';

const formatarValor = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export function exportarServicosPdf(ranking: ServicoMaisAgendado[], filtros: string[]) {
  const d = criarDocumento({ titulo: 'Serviços mais agendados', filtros });

  const totalAgendamentos = ranking.reduce((soma, item) => soma + item.quantidade, 0);
  const valorTotal = ranking.reduce((soma, item) => soma + Number(item.valorTotalEstimado), 0);
  adicionarResumo(d, [
    ['Total de agendamentos', String(totalAgendamentos)],
    ['Valor total estimado', formatarValor(valorTotal)],
  ]);

  adicionarSubtitulo(d, 'Ranking');
  adicionarTabela(
    d,
    ['#', 'Serviço', 'Agendamentos', 'Valor total estimado'],
    ranking.map((item, indice) => [
      String(indice + 1),
      item.nome,
      String(item.quantidade),
      formatarValor(Number(item.valorTotalEstimado)),
    ]),
  );

  finalizar(d, 'relatorio-servicos-mais-agendados');
}
