// ===== EXPORTAR AVALIACOES PDF =====
// Ctrl+F "EXPORTAR AVALIACOES PDF" para achar este bloco.
import type { RelatorioAvaliacoes } from '@/types/relatorio';
import { adicionarResumo, adicionarSubtitulo, adicionarTabela, criarDocumento, finalizar } from './compartilhado';

const NOTAS = [5, 4, 3, 2, 1];

export function exportarAvaliacoesPdf(relatorio: RelatorioAvaliacoes, filtros: string[]) {
  const d = criarDocumento({ titulo: 'Relatório de Avaliações', filtros });

  adicionarResumo(d, [
    ['Média geral', `${relatorio.mediaGeral?.toFixed(2).replace('.', ',') ?? '-'} / 5`],
    ['Avaliações registradas', String(relatorio.total)],
  ]);

  adicionarSubtitulo(d, 'Distribuição das notas');
  adicionarTabela(
    d,
    ['Nota', 'Quantidade'],
    NOTAS.map((nota) => [`${nota} estrela${nota > 1 ? 's' : ''}`, String(relatorio.distribuicao[nota])]),
    { tableWidth: 80 },
  );

  adicionarSubtitulo(d, 'Comentários mais recentes');
  adicionarTabela(
    d,
    ['Nota', 'Cliente', 'Serviço / Profissional', 'Data', 'Comentário'],
    relatorio.comentariosRecentes.map((c) => [
      `${c.nota}/5`,
      c.cliente,
      `${c.servico} / ${c.profissional}`,
      new Date(c.criadoEm).toLocaleDateString('pt-BR'),
      c.comentario,
    ]),
    { columnStyles: { 4: { cellWidth: 60 } } },
  );

  finalizar(d, 'relatorio-avaliacoes');
}
