// Reexporta as funções de Relatórios, cada uma no seu próprio arquivo nesta
// pasta, para quem importar de '@/lib/relatorios' continuar funcionando.
export { gerarRelatorioAgendamentos } from './gerar-relatorio-agendamentos';
export { gerarRelatorioServicosMaisAgendados } from './gerar-relatorio-servicos-mais-agendados';
export { exportarAgendamentosCsv } from './exportar-agendamentos-csv';
