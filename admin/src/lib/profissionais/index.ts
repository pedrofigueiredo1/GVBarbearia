// Reexporta as funções de Profissionais, cada uma no seu próprio arquivo
// nesta pasta, para quem importar de '@/lib/profissionais' continuar
// funcionando.
export { listarProfissionais } from './listar-profissionais';
export { criarProfissional } from './adicionar-profissional';
export { editarProfissional } from './editar-profissional';
export { excluirProfissional } from './excluir-profissional';
