export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  // Prisma serializa campos Decimal como string em JSON (preserva precisão
  // que um number do JS não garante), então o valor chega como string.
  valor: string;
  duracaoMinutos: number;
  criadoEm: string;
  atualizadoEm: string;
}

// Formato enviado ao criar/editar — sem os campos gerados pelo banco.
export interface ServicoInput {
  nome: string;
  descricao: string;
  valor: number;
  duracaoMinutos: number;
}
