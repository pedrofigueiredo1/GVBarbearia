// ===== EDITAR SERVICO =====
// Ctrl+F "EDITAR SERVICO" para achar este bloco.
// US "Edição de Serviço" (item 2.11 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateServicoDto } from '../dto/update-servico.dto';
import { BuscarServico } from './buscar-servico';

@Injectable()
export class EditarServico {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarServico: BuscarServico,
  ) {}

  async executar(id: number, dto: UpdateServicoDto) {
    await this.buscarServico.executar(id);

    return this.prisma.servico.update({
      where: { id },
      data: dto,
    });
  }
}
