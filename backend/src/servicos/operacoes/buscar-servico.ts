// ===== BUSCAR SERVICO POR ID =====
// Ctrl+F "BUSCAR SERVICO" para achar este bloco.
// Usado pela rota GET /servicos/:id e também internamente por Editar
// Serviço e Excluir Serviço, para confirmar que o registro existe.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BuscarServico {
  constructor(private readonly prisma: PrismaService) {}

  async executar(id: number) {
    const servico = await this.prisma.servico.findUnique({ where: { id } });

    if (!servico) {
      throw new NotFoundException(`Serviço com id ${id} não foi encontrado.`);
    }

    return servico;
  }
}
