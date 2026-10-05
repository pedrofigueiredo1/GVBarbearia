// ===== BUSCAR AVALIACAO POR ID =====
// Ctrl+F "BUSCAR AVALIACAO" para achar este bloco.
// Usado pela rota GET /avaliacoes/:id e também internamente por Editar
// Avaliação e Excluir Avaliação.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { INCLUDE_AGENDAMENTO } from './compartilhado';

@Injectable()
export class BuscarAvaliacao {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id },
      include: INCLUDE_AGENDAMENTO,
    });

    if (!avaliacao) {
      throw new NotFoundException(`Avaliação com id ${id} não foi encontrada.`);
    }

    return avaliacao;
  }
}
