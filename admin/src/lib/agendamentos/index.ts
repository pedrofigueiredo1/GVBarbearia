// Reexporta as funções de Agendamentos, cada uma no seu próprio arquivo
// nesta pasta, para quem importar de '@/lib/agendamentos' continuar
// funcionando.
export { listarAgendamentos } from './listar-agendamentos';
export { criarAgendamento } from './adicionar-agendamento';
export { editarAgendamento } from './editar-agendamento';
export { cancelarAgendamento } from './cancelar-agendamento';
export { listarAgendamentosPaginado } from './listar-agendamentos-paginado';
export { consultarHorariosDisponiveis } from './consultar-horarios-disponiveis';
