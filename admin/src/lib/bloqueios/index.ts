// Reexporta as funções de Bloqueios de agenda, cada uma no seu próprio arquivo
// nesta pasta, para quem importar de '@/lib/bloqueios' continuar funcionando.
export { listarBloqueios } from './listar-bloqueios';
export { criarBloqueio } from './adicionar-bloqueio';
export { excluirBloqueio } from './excluir-bloqueio';
export { encontrarBloqueio } from './encontrar-bloqueio';
