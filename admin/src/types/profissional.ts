export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Formato enviado ao criar/editar — sem os campos gerados pelo banco.
export interface ProfissionalInput {
  nome: string;
  especialidade: string;
  descricao: string;
}
