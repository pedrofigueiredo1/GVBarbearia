// ===== LISTAR PROFISSIONAIS =====
// Ctrl+F "LISTAR PROFISSIONAIS" para achar este bloco.
// US "Consulta de Profissional" (item 2.14 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ListarProfissionais {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.profissional.findMany({
      orderBy: { nome: 'asc' },
    });
  }
}
