// ===== EXPORTAR ATENDIMENTO POR PROFISSIONAL PDF =====
// Ctrl+F "EXPORTAR ATENDIMENTO POR PROFISSIONAL PDF" para achar este bloco.
import type { RelatorioAtendimentoProfissional } from '@/types/relatorio';
import { adicionarResumo, adicionarSubtitulo, adicionarTabela, criarDocumento, finalizar } from './compartilhado';

export function exportarAtendimentoProfissionalPdf(
  relatorio: RelatorioAtendimentoProfissional,
  filtros: string[],
) {
  const d = criarDocumento({ titulo: 'Atendimento por profissional', filtros });

  adicionarResumo(d, [['Atendimentos concluídos', String(relatorio.totalAtendimentos)]]);

  adicionarSubtitulo(d, 'Profissionais');
  adicionarTabela(
    d,
    ['Profissional', 'Atendimentos', 'Serviços mais realizados', 'Avaliação média'],
    relatorio.profissionais.map((p) => [
      `${p.nome} (${p.especialidade})`,
      String(p.atendimentos),
      p.servicosMaisRealizados.length === 0
        ? '-'
        : p.servicosMaisRealizados.map((s) => `${s.nome} (${s.quantidade})`).join(', '),
      p.avaliacaoMedia === null
        ? 'Sem avaliações'
        : `${p.avaliacaoMedia.toFixed(2).replace('.', ',')} (${p.totalAvaliacoes})`,
    ]),
  );

  finalizar(d, 'relatorio-atendimento-profissional');
}
