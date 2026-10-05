// ===== LISTAR ADMINISTRADORES =====
// Ctrl+F "LISTAR ADMINISTRADORES" para achar este bloco.
// US "Consulta de Administrador" (item 2.4 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class ListarAdministradores {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.administrador.findMany({
      select: SELECT_SEM_SENHA,
      orderBy: { nome: 'asc' },
    });
  }
}
