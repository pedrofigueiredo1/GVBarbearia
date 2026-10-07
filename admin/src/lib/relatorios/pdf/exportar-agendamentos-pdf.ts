// ===== EXPORTAR AGENDAMENTOS PDF =====
// Ctrl+F "EXPORTAR AGENDAMENTOS PDF" para achar este bloco.
import type { RelatorioAgendamentos } from '@/types/relatorio';
import { STATUS_LABEL, type StatusAgendamento } from '@/types/agendamento';
import { adicionarResumo, adicionarSubtitulo, adicionarTabela, criarDocumento, finalizar } from './compartilhado';

const ORDEM: StatusAgendamento[] = ['CONFIRMADO', 'CONCLUIDO', 'CANCELADO', 'PENDENTE'];

export function exportarAgendamentosPdf(relatorio: RelatorioAgendamentos, filtros: string[]) {
  const d = criarDocumento({ titulo: 'Relatório de Agendamentos', filtros });

  adicionarResumo(d, [
    ...ORDEM.map((status): [string, string] => [STATUS_LABEL[status], String(relatorio.totais[status])]),
    ['Total no período', String(relatorio.total)],
  ]);

  adicionarSubtitulo(d, 'Agendamentos');
  adicionarTabela(
    d,
    ['Data e horário', 'Cliente', 'Serviço', 'Profissional', 'Status'],
    relatorio.agendamentos.map((a) => [
      new Date(a.dataHora).toLocaleString('pt-BR'),
      a.cliente.nome,
      a.servico.nome,
      a.profissional.nome,
      STATUS_LABEL[a.status],
    ]),
  );

  finalizar(d, 'relatorio-agendamentos');
}
