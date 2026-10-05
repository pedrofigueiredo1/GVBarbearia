// ===== LISTAR PRODUTOS =====
// Ctrl+F "LISTAR PRODUTOS" para achar este bloco.
// US "Consulta de Produto" (item 2.18 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ListarProdutos {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.produto.findMany({
      orderBy: { nome: 'asc' },
    });
  }
}
