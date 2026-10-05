// ===== BUSCAR CLIENTE POR ID =====
// Ctrl+F "BUSCAR CLIENTE" para achar este bloco.
// Usado pela rota GET /clientes/:id e também internamente por Editar
// Cliente e Excluir Cliente.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class BuscarCliente {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      select: SELECT_SEM_SENHA,
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com id ${id} não foi encontrado.`);
    }

    return cliente;
  }
}
