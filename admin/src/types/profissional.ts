export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  // Quando a foto foi trocada pela última vez (null = sem foto).
  fotoAtualizadaEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

// Formato enviado ao criar/editar — sem os campos gerados pelo banco.
export interface ProfissionalInput {
  nome: string;
  especialidade: string;
  descricao: string;
}
