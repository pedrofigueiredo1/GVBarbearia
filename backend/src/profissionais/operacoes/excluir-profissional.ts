// ===== EXCLUIR PROFISSIONAL =====
// Ctrl+F "EXCLUIR PROFISSIONAL" para achar este bloco.
// US "Exclusão de Profissional" (item 2.16 da documentação).
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarProfissional } from './buscar-profissional';

@Injectable()
export class ExcluirProfissional {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarProfissional: BuscarProfissional,
  ) {}

  async executar(id: number) {
    await this.buscarProfissional.executar(id);

    // Regra de negócio da US Exclusão de Profissional: o sistema pode
    // impedir a exclusão quando há agendamentos futuros vinculados.
    const agendamentoFuturo = await this.prisma.agendamento.findFirst({
      where: {
        profissionalId: id,
        dataHora: { gt: new Date() },
        status: { in: [StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO] },
      },
    });

    if (agendamentoFuturo) {
      throw new ConflictException(
        'Não é possível excluir um profissional com agendamentos futuros pendentes ou confirmados.',
      );
    }

    try {
      return await this.prisma.profissional.delete({ where: { id } });
    } catch (error) {
      // Mesmo sem agendamentos futuros pendentes/confirmados, pode existir
      // histórico de agendamentos concluídos/cancelados vinculados — o
      // banco impede o delete físico (chave estrangeira). Sem uma exclusão
      // lógica (fora do escopo atual), a mensagem abaixo ao menos evita um
      // 500 genérico.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir: existe histórico de agendamentos vinculado a este profissional.',
        );
      }
      throw error;
    }
  }
}
