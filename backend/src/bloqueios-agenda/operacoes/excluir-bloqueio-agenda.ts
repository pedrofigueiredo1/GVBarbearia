// ===== EXCLUIR BLOQUEIO DE AGENDA =====
// Ctrl+F "EXCLUIR BLOQUEIO DE AGENDA" para achar este bloco.
// Remove o bloqueio e a agenda volta a aceitar agendamentos naqueles dias.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExcluirBloqueioAgenda {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const bloqueio = await this.prisma.bloqueioAgenda.findUnique({
      where: { id },
    });
    if (!bloqueio) {
      throw new NotFoundException(`Bloqueio com id ${id} não foi encontrado.`);
    }
    return this.prisma.bloqueioAgenda.delete({ where: { id } });
  }
}
