// ===== EDITAR PRODUTO =====
// Ctrl+F "EDITAR PRODUTO" para achar este bloco.
// US "Edição de Produto" (item 2.19 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProdutoDto } from '../dto/update-produto.dto';
import { BuscarProduto } from './buscar-produto';

@Injectable()
export class EditarProduto {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarProduto: BuscarProduto,
  ) {}

  async executar(id: number, dto: UpdateProdutoDto) {
    await this.buscarProduto.executar(id);

    return this.prisma.produto.update({
      where: { id },
      data: dto,
    });
  }
}
