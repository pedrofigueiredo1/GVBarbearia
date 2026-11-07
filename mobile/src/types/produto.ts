export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  // Quando a foto foi trocada pela última vez (null = sem foto).
  fotoAtualizadaEm: string | null;
}
