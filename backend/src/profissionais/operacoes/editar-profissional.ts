// ===== EDITAR PROFISSIONAL =====
// Ctrl+F "EDITAR PROFISSIONAL" para achar este bloco.
// US "Edição de Profissional" (item 2.15 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfissionalDto } from '../dto/update-profissional.dto';
import { BuscarProfissional } from './buscar-profissional';

@Injectable()
export class EditarProfissional {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarProfissional: BuscarProfissional,
  ) {}

  async executar(id: number, dto: UpdateProfissionalDto) {
    await this.buscarProfissional.executar(id);

    return this.prisma.profissional.update({
      where: { id },
      data: dto,
    });
  }
}
