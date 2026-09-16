export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  criadoEm: string;
  atualizadoEm: string;
}

// senha é opcional aqui: no cadastro a tela exige o preenchimento; na
// edição, em branco significa "manter a senha atual" (mesmo padrão de
// Administrador).
export interface ClienteInput {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
}
