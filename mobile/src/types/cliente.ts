export interface ClienteLogado {
  id: number;
  nome: string;
  email: string;
}

export interface LoginClienteResposta {
  accessToken: string;
  cliente: ClienteLogado;
}

export interface CadastroClienteInput {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

export interface MensagemResposta {
  mensagem: string;
}

export interface Perfil {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

// Só os campos que mudaram são enviados. senhaAtual é exigida pelo backend
// para trocar o e-mail ou a senha.
export interface EditarPerfilInput {
  nome?: string;
  email?: string;
  telefone?: string;
  senhaAtual?: string;
  novaSenha?: string;
}
