// ===== RELATORIO DE ATENDIMENTO POR PROFISSIONAL =====
// Ctrl+F "RELATORIO DE ATENDIMENTO POR PROFISSIONAL" para achar este bloco.
// US "Relatório de Atendimento por Profissional" (item 2.34 da documentação).
// Só agendamentos CONCLUIDO contam como atendimento realizado. A nota média
// vem das avaliações ligadas a esses atendimentos (null quando não há nenhuma).
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';
import { montarWhereAgendamentos } from './compartilhado';

interface Acumulador {
  atendimentos: number;
  servicos: Map<number, { nome: string; quantidade: number }>;
  somaNotas: number;
  totalAvaliacoes: number;
}

@Injectable()
export class RelatorioAtendimentoProfissional {
  constructor(private readonly prisma: PrismaService) {}

  async executar(filtros: FiltrosRelatorioDto) {
    const where = {
      ...montarWhereAgendamentos(filtros),
      status: StatusAgendamento.CONCLUIDO,
    };

    const [profissionais, atendimentos] = await Promise.all([
      this.prisma.profissional.findMany({
        where: filtros.profissionalId !== undefined ? { id: filtros.profissionalId } : {},
        orderBy: { nome: 'asc' },
      }),
      this.prisma.agendamento.findMany({
        where,
        select: {
          profissionalId: true,
          servico: { select: { id: true, nome: true } },
          avaliacao: { select: { nota: true } },
        },
      }),
    ]);

    const porProfissional = new Map<number, Acumulador>();
    for (const atendimento of atendimentos) {
      const acc =
        porProfissional.get(atendimento.profissionalId) ??
        { atendimentos: 0, servicos: new Map(), somaNotas: 0, totalAvaliacoes: 0 };

      acc.atendimentos += 1;
      const servico = acc.servicos.get(atendimento.servico.id);
      if (servico) {
        servico.quantidade += 1;
      } else {
        acc.servicos.set(atendimento.servico.id, { nome: atendimento.servico.nome, quantidade: 1 });
      }
      if (atendimento.avaliacao) {
        acc.somaNotas += atendimento.avaliacao.nota;
        acc.totalAvaliacoes += 1;
      }
      porProfissional.set(atendimento.profissionalId, acc);
    }

    const resultado = profissionais.map((profissional) => {
      const acc = porProfissional.get(profissional.id);
      return {
        profissionalId: profissional.id,
        nome: profissional.nome,
        especialidade: profissional.especialidade,
        atendimentos: acc?.atendimentos ?? 0,
        servicosMaisRealizados: acc
          ? [...acc.servicos.values()].sort((a, b) => b.quantidade - a.quantidade)
          : [],
        avaliacaoMedia:
          acc && acc.totalAvaliacoes > 0
            ? Number((acc.somaNotas / acc.totalAvaliacoes).toFixed(2))
            : null,
        totalAvaliacoes: acc?.totalAvaliacoes ?? 0,
      };
    });

    return { totalAtendimentos: atendimentos.length, profissionais: resultado };
  }
}
