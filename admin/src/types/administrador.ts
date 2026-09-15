export interface Administrador {
  id: number;
  nome: string;
  login: string;
  criadoEm: string;
  atualizadoEm: string;
}

// senha é opcional aqui porque na edição um campo vazio significa "manter a
// senha atual" — no cadastro, a tela exige o preenchimento (ver
// AdministradorFormModal).
export interface AdministradorInput {
  nome: string;
  login: string;
  senha?: string;
}
