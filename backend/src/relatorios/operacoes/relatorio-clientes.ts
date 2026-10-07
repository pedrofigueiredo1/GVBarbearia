// ===== RELATORIO DE CLIENTES =====
// Ctrl+F "RELATORIO DE CLIENTES" para achar este bloco.
// US "Relatório de Clientes" (item 2.35 da documentação). "Cliente frequente"
// (5 ou mais agendamentos CONCLUIDO) é calculado aqui, na hora de gerar o
// relatório — não existe campo salvo no banco para isso. O período filtra só
// os "novos clientes" (data de cadastro); as contagens por cliente refletem
// todos os registros atuais, como exige a regra da US.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';
import { CLIENTE_FREQUENTE_MINIMO_CONCLUIDOS } from './compartilhado';

@Injectable()
export class RelatorioClientes {
  constructor(private readonly prisma: PrismaService) {}

  async executar(filtros: FiltrosRelatorioDto) {
    const inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : undefined;
    const fim = filtros.dataFim ? new Date(filtros.dataFim) : undefined;

    const clientes = await this.prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        criadoEm: true,
        agendamentos: { select: { dataHora: true, status: true } },
      },
      orderBy: { nome: 'asc' },
    });

    const linhas = clientes.map((cliente) => {
      const concluidos = cliente.agendamentos.filter(
        (a) => a.status === StatusAgendamento.CONCLUIDO,
      ).length;
      const ultimoAgendamento = cliente.agendamentos.reduce<Date | null>(
        (maisRecente, a) => (maisRecente === null || a.dataHora > maisRecente ? a.dataHora : maisRecente),
        null,
      );

      return {
        clienteId: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        criadoEm: cliente.criadoEm,
        totalAgendamentos: cliente.agendamentos.length,
        agendamentosConcluidos: concluidos,
        ultimoAgendamento,
        frequente: concluidos >= CLIENTE_FREQUENTE_MINIMO_CONCLUIDOS,
      };
    });

    const novosNoPeriodo = clientes.filter(
      (c) => (!inicio || c.criadoEm >= inicio) && (!fim || c.criadoEm <= fim),
    ).length;

    return {
      totalClientes: clientes.length,
      novosNoPeriodo,
      totalFrequentes: linhas.filter((l) => l.frequente).length,
      clientes: linhas,
    };
  }
}
