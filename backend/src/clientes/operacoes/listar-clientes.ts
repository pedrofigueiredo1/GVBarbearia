// ===== LISTAR CLIENTES =====
// Ctrl+F "LISTAR CLIENTES" para achar este bloco.
// US "Consulta de Clientes" (item 2.21 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class ListarClientes {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.cliente.findMany({
      select: SELECT_SEM_SENHA,
      orderBy: { nome: 'asc' },
    });
  }
}
