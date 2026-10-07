// ===== EXPORTAR CLIENTES PDF =====
// Ctrl+F "EXPORTAR CLIENTES PDF" para achar este bloco.
import type { RelatorioClientes } from '@/types/relatorio';
import { adicionarResumo, adicionarSubtitulo, adicionarTabela, criarDocumento, finalizar } from './compartilhado';

export function exportarClientesPdf(relatorio: RelatorioClientes, filtros: string[]) {
  // Paisagem: a tabela tem 7 colunas.
  const d = criarDocumento({ titulo: 'Relatório de Clientes', filtros, orientacao: 'landscape' });

  adicionarResumo(d, [
    ['Clientes cadastrados', String(relatorio.totalClientes)],
    ['Novos no período', String(relatorio.novosNoPeriodo)],
    ['Frequentes (5+ concluídos)', String(relatorio.totalFrequentes)],
  ]);

  adicionarSubtitulo(d, 'Clientes');
  adicionarTabela(
    d,
    ['Cliente', 'E-mail', 'Cadastro', 'Agendamentos', 'Concluídos', 'Último agendamento', 'Frequente'],
    relatorio.clientes.map((c) => [
      c.nome,
      c.email,
      new Date(c.criadoEm).toLocaleDateString('pt-BR'),
      String(c.totalAgendamentos),
      String(c.agendamentosConcluidos),
      c.ultimoAgendamento ? new Date(c.ultimoAgendamento).toLocaleString('pt-BR') : 'Nenhum',
      c.frequente ? 'Sim' : 'Não',
    ]),
  );

  finalizar(d, 'relatorio-clientes');
}
