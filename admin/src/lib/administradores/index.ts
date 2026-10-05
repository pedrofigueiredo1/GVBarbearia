// Reexporta as funções de Administradores, cada uma no seu próprio arquivo
// nesta pasta, para quem importar de '@/lib/administradores' continuar
// funcionando.
export { listarAdministradores } from './listar-administradores';
export { criarAdministrador } from './adicionar-administrador';
export { editarAdministrador } from './editar-administrador';
export { excluirAdministrador } from './excluir-administrador';
