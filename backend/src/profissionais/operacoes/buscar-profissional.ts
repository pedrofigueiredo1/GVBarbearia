// ===== BUSCAR PROFISSIONAL POR ID =====
// Ctrl+F "BUSCAR PROFISSIONAL" para achar este bloco.
// Usado pela rota GET /profissionais/:id e também internamente por
// Editar Profissional e Excluir Profissional, para confirmar que o
// registro existe antes de alterar/remover.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuscarProfissional {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const profissional = await this.prisma.profissional.findUnique({
      where: { id },
    });

    if (!profissional) {
      throw new NotFoundException(
        `Profissional com id ${id} não foi encontrado.`,
      );
    }

    return profissional;
  }
}
