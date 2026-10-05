// ===== LISTAR AGENDAMENTOS =====
// Ctrl+F "LISTAR AGENDAMENTOS" para achar este bloco.
// US "Consulta de Agendamento" (item 2.25 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { INCLUDE_RELACOES } from './compartilhado';

@Injectable()
export class ListarAgendamentos {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.agendamento.findMany({
      include: INCLUDE_RELACOES,
      orderBy: { dataHora: 'asc' },
    });
  }
}
