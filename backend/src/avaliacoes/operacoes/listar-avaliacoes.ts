// ===== LISTAR AVALIACOES =====
// Ctrl+F "LISTAR AVALIACOES" para achar este bloco.
// US "Consulta de Avaliação" (item 2.28 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { INCLUDE_AGENDAMENTO } from './compartilhado';

@Injectable()
export class ListarAvaliacoes {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.avaliacao.findMany({
      include: INCLUDE_AGENDAMENTO,
      orderBy: { criadoEm: 'desc' },
    });
  }
}
