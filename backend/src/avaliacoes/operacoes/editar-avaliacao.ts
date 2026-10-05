// ===== EDITAR AVALIACAO =====
// Ctrl+F "EDITAR AVALIACAO" para achar este bloco.
// US "Edição de Avaliação" (item 2.29 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAvaliacaoDto } from '../dto/update-avaliacao.dto';
import { BuscarAvaliacao } from './buscar-avaliacao';
import { INCLUDE_AGENDAMENTO } from './compartilhado';

@Injectable()
export class EditarAvaliacao {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAvaliacao: BuscarAvaliacao,
  ) {}

  async executar(id: number, dto: UpdateAvaliacaoDto) {
    await this.buscarAvaliacao.executar(id);

    return this.prisma.avaliacao.update({
      where: { id },
      data: dto,
      include: INCLUDE_AGENDAMENTO,
    });
  }
}
