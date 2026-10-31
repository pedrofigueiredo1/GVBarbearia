// ===== RESUMO DO DIA =====
// Ctrl+F "RESUMO DO DIA" para achar este bloco.
// O que a recepção precisa ver ao abrir o painel: a agenda de hoje (todos os
// agendamentos que não foram cancelados, em ordem de horário) e os
// agendamentos PENDENTES aguardando confirmação da barbearia.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { hojeLocal, instanteDoDia, somarDias } from './compartilhado';

const LIMITE_PENDENTES = 8;

const SELECT_RESUMO = {
  id: true,
  dataHora: true,
  status: true,
  cliente: { select: { id: true, nome: true } },
  servico: { select: { id: true, nome: true, duracaoMinutos: true } },
  profissional: { select: { id: true, nome: true } },
};

@Injectable()
export class ResumoDoDia {
  constructor(private readonly prisma: PrismaService) {}

  async executar() {
    const hoje = hojeLocal();
    const inicioHoje = instanteDoDia(hoje);
    const inicioAmanha = instanteDoDia(somarDias(hoje, 1));

    const [agendaHoje, pendentes, pendentesTotal] = await Promise.all([
      this.prisma.agendamento.findMany({
        where: {
          dataHora: { gte: inicioHoje, lt: inicioAmanha },
          status: { not: StatusAgendamento.CANCELADO },
        },
        select: SELECT_RESUMO,
        orderBy: { dataHora: 'asc' },
      }),
      // Pendentes que ainda não passaram: um pendente de ontem já perdeu o
      // sentido de "confirmar".
      this.prisma.agendamento.findMany({
        where: {
          status: StatusAgendamento.PENDENTE,
          dataHora: { gte: inicioHoje },
        },
        select: SELECT_RESUMO,
        orderBy: { dataHora: 'asc' },
        take: LIMITE_PENDENTES,
      }),
      this.prisma.agendamento.count({
        where: {
          status: StatusAgendamento.PENDENTE,
          dataHora: { gte: inicioHoje },
        },
      }),
    ]);

    return { agendaHoje, pendentes, pendentesTotal };
  }
}
