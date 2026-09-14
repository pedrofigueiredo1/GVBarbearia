export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  // Prisma serializa campos Decimal como string em JSON (preserva precisão
  // que um number do JS não garante), então o preço chega como string.
  preco: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Formato enviado ao criar/editar — sem os campos gerados pelo banco.
export interface ProdutoInput {
  nome: string;
  descricao: string;
  preco: number;
}
