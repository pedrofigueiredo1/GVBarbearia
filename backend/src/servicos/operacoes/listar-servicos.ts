// ===== LISTAR SERVICOS =====
// Ctrl+F "LISTAR SERVICOS" para achar este bloco.
// US "Consulta de Serviço" (item 2.10 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ListarServicos {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.servico.findMany({
      orderBy: { nome: 'asc' },
    });
  }
}
