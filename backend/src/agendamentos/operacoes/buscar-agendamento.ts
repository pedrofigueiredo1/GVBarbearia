// ===== BUSCAR AGENDAMENTO POR ID =====
// Ctrl+F "BUSCAR AGENDAMENTO" para achar este bloco.
// Usado pela rota GET /agendamentos/:id e também internamente por Editar
// Agendamento e Cancelar Agendamento.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { INCLUDE_RELACOES } from './compartilhado';

@Injectable()
export class BuscarAgendamento {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
      include: INCLUDE_RELACOES,
    });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento com id ${id} não foi encontrado.`);
    }

    return agendamento;
  }
}
