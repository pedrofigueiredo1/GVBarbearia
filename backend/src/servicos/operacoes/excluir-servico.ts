// ===== EXCLUIR SERVICO =====
// Ctrl+F "EXCLUIR SERVICO" para achar este bloco.
// US "Exclusão de Serviço" (item 2.12 da documentação).
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarServico } from './buscar-servico';

@Injectable()
export class ExcluirServico {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarServico: BuscarServico,
  ) {}

  async executar(id: number) {
    await this.buscarServico.executar(id);

    // Regra de negócio da US Exclusão de Serviço: o sistema pode bloquear a
    // exclusão quando há agendamentos futuros vinculados.
    const agendamentoFuturo = await this.prisma.agendamento.findFirst({
      where: {
        servicoId: id,
        dataHora: { gt: new Date() },
        status: { in: [StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO] },
      },
    });

    if (agendamentoFuturo) {
      throw new ConflictException(
        'Não é possível excluir um serviço com agendamentos futuros pendentes ou confirmados.',
      );
    }

    try {
      return await this.prisma.servico.delete({ where: { id } });
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
          'Não é possível excluir: existe histórico de agendamentos vinculado a este serviço.',
        );
      }
      throw error;
    }
  }
}
