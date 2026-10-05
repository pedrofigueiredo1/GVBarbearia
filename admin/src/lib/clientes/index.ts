// Reexporta as funções de Clientes, cada uma no seu próprio arquivo nesta
// pasta, para quem importar de '@/lib/clientes' continuar funcionando.
export { listarClientes } from './listar-clientes';
export { criarCliente } from './adicionar-cliente';
export { editarCliente } from './editar-cliente';
export { excluirCliente } from './excluir-cliente';
