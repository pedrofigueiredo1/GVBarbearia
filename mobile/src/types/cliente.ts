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
