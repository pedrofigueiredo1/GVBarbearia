// ===== CADASTRAR PRODUTO =====
// Ctrl+F "CADASTRAR PRODUTO" para achar este bloco.
// US "Cadastro de Produto" (item 2.17 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProdutoDto } from '../dto/create-produto.dto';

@Injectable()
export class AdicionarProduto {
  constructor(private readonly prisma: PrismaService) {}

  executar(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto });
  }
}
