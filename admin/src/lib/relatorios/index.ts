// Reexporta as funções de Relatórios, cada uma no seu próprio arquivo nesta
// pasta, para quem importar de '@/lib/relatorios' continuar funcionando.
export { gerarRelatorioAgendamentos } from './gerar-relatorio-agendamentos';
export { gerarRelatorioServicosMaisAgendados } from './gerar-relatorio-servicos-mais-agendados';
export { gerarRelatorioAtendimentoProfissional } from './gerar-relatorio-atendimento-profissional';
export { gerarRelatorioClientes } from './gerar-relatorio-clientes';
export { gerarRelatorioAvaliacoes } from './gerar-relatorio-avaliacoes';
export { exportarAgendamentosPdf } from './pdf/exportar-agendamentos-pdf';
export { exportarServicosPdf } from './pdf/exportar-servicos-pdf';
export { exportarAtendimentoProfissionalPdf } from './pdf/exportar-atendimento-profissional-pdf';
export { exportarClientesPdf } from './pdf/exportar-clientes-pdf';
export { exportarAvaliacoesPdf } from './pdf/exportar-avaliacoes-pdf';
export { descreverFiltros } from './pdf/descrever-filtros';
export { SEM_FILTROS } from './pdf/compartilhado';
