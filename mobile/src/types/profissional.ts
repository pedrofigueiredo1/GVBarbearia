export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  // Quando a foto foi trocada pela última vez (null = sem foto).
  fotoAtualizadaEm: string | null;
}
