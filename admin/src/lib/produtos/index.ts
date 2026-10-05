// Reexporta as funções de Produtos, cada uma no seu próprio arquivo nesta
// pasta, para quem importar de '@/lib/produtos' continuar funcionando.
export { listarProdutos } from './listar-produtos';
export { criarProduto } from './adicionar-produto';
export { editarProduto } from './editar-produto';
export { excluirProduto } from './excluir-produto';
