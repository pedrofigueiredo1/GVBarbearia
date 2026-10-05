// ===== BUSCAR ADMINISTRADOR POR ID =====
// Ctrl+F "BUSCAR ADMINISTRADOR" para achar este bloco.
// Usado pela rota GET /administradores/:id e também internamente por
// Editar Administrador e Excluir Administrador.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class BuscarAdministrador {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { id },
      select: SELECT_SEM_SENHA,
    });

    if (!administrador) {
      throw new NotFoundException(`Administrador com id ${id} não foi encontrado.`);
    }

    return administrador;
  }
}
