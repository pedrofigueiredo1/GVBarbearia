// ===== EXCLUIR AVALIACAO =====
// Ctrl+F "EXCLUIR AVALIACAO" para achar este bloco.
// US "Exclusão de Avaliação" (item 2.30 da documentação) — diferente de
// Agendamento, aqui a exclusão é remoção real (hard delete): os critérios
// e testes da US descrevem isso literalmente, sem menção a status.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarAvaliacao } from './buscar-avaliacao';

@Injectable()
export class ExcluirAvaliacao {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAvaliacao: BuscarAvaliacao,
  ) {}

  async executar(id: number) {
    await this.buscarAvaliacao.executar(id);

    return this.prisma.avaliacao.delete({ where: { id } });
  }
}
