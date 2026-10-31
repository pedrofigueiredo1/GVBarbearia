// ===== INDICADORES DO PERÍODO =====
// Ctrl+F "INDICADORES DO PERÍODO" para achar este bloco.
// Números dos últimos 30 dias que explicam o fluxo da barbearia: taxa de
// cancelamento, clientes novos, serviços e profissionais que mais atendem e a
// nota das avaliações.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CLIENTE_FREQUENTE_MINIMO_CONCLUIDOS } from '../../relatorios/operacoes/compartilhado';
import { hojeLocal, instanteDoDia, somarDias } from './compartilhado';

interface Ranking {
  nome: string;
  atendimentos: number;
  faturamento: number;
}

@Injectable()
export class IndicadoresDoPeriodo {
  constructor(private readonly prisma: PrismaService) {}

  async executar() {
    const hoje = hojeLocal();
    const inicio = instanteDoDia(somarDias(hoje, -29));
    const fim = instanteDoDia(somarDias(hoje, 1));
    const noPeriodo = { dataHora: { gte: inicio, lt: fim } };

    const [
      porStatus,
      novosClientes,
      frequentes,
      concluidos,
      avaliacaoGeral,
      avaliacaoPeriodo,
    ] = await Promise.all([
      this.prisma.agendamento.groupBy({
        by: ['status'],
        where: noPeriodo,
        _count: { _all: true },
      }),
      this.prisma.cliente.count({
        where: { criadoEm: { gte: inicio, lt: fim } },
      }),
      this.prisma.agendamento.groupBy({
        by: ['clienteId'],
        where: { status: StatusAgendamento.CONCLUIDO },
        _count: { _all: true },
        having: {
          clienteId: { _count: { gte: CLIENTE_FREQUENTE_MINIMO_CONCLUIDOS } },
        },
      }),
      this.prisma.agendamento.findMany({
        where: { ...noPeriodo, status: StatusAgendamento.CONCLUIDO },
        select: {
          servico: { select: { id: true, nome: true, valor: true } },
          profissional: { select: { id: true, nome: true } },
        },
      }),
      this.prisma.avaliacao.aggregate({
        _avg: { nota: true },
        _count: { _all: true },
      }),
      this.prisma.avaliacao.aggregate({
        where: { criadoEm: { gte: inicio, lt: fim } },
        _avg: { nota: true },
        _count: { _all: true },
      }),
    ]);

    const total = porStatus.reduce((soma, s) => soma + s._count._all, 0);
    const cancelados =
      porStatus.find((s) => s.status === StatusAgendamento.CANCELADO)?._count
        ._all ?? 0;

    // Agrupa os atendimentos concluídos por serviço e por profissional.
    const servicos = new Map<number, Ranking>();
    const profissionais = new Map<number, Ranking>();
    for (const a of concluidos) {
      const valor = Number(a.servico.valor);

      const s = servicos.get(a.servico.id) ?? {
        nome: a.servico.nome,
        atendimentos: 0,
        faturamento: 0,
      };
      s.atendimentos += 1;
      s.faturamento += valor;
      servicos.set(a.servico.id, s);

      const p = profissionais.get(a.profissional.id) ?? {
        nome: a.profissional.nome,
        atendimentos: 0,
        faturamento: 0,
      };
      p.atendimentos += 1;
      p.faturamento += valor;
      profissionais.set(a.profissional.id, p);
    }

    const ordenar = (itens: Ranking[]) =>
      itens
        .map((i) => ({
          ...i,
          faturamento: Math.round(i.faturamento * 100) / 100,
        }))
        .sort((x, y) => y.atendimentos - x.atendimentos);
    const nota = (n: number | null) =>
      n === null ? null : Math.round(n * 10) / 10;

    return {
      agendamentos: {
        total,
        cancelados,
        taxaCancelamento:
          total === 0 ? 0 : Math.round((cancelados / total) * 1000) / 10,
      },
      clientes: { novos: novosClientes, frequentes: frequentes.length },
      topServicos: ordenar([...servicos.values()]).slice(0, 5),
      porProfissional: ordenar([...profissionais.values()]),
      avaliacoes: {
        mediaGeral: nota(avaliacaoGeral._avg.nota),
        totalGeral: avaliacaoGeral._count._all,
        mediaPeriodo: nota(avaliacaoPeriodo._avg.nota),
        totalPeriodo: avaliacaoPeriodo._count._all,
      },
    };
  }
}
