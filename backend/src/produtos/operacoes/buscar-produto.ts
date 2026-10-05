// ===== BUSCAR PRODUTO POR ID =====
// Ctrl+F "BUSCAR PRODUTO" para achar este bloco.
// Usado pela rota GET /produtos/:id e também internamente por Editar
// Produto e Excluir Produto, para confirmar que o registro existe.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuscarProduto {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com id ${id} não foi encontrado.`);
    }

    return produto;
  }
}
