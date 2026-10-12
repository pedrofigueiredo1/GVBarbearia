// Reexporta as funções de autenticação do cliente, cada uma no seu próprio
// arquivo nesta pasta, para quem importar de '@/lib/auth-cliente'.
export { loginCliente } from './login-cliente';
export { consultarClienteLogado } from './consultar-cliente-logado';
export { solicitarRecuperacaoSenha } from './solicitar-recuperacao-senha';
export { redefinirSenha } from './redefinir-senha';
