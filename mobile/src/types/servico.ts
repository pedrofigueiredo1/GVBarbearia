export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  // O Prisma devolve Decimal como texto (ex.: "90"), por isso vem como string.
  valor: string;
  duracaoMinutos: number;
}
