// ===== PASSAGEM DE CLIENTES =====
// Ctrl+F "PASSAGEM DE CLIENTES" para achar este bloco.
// Quantos clientes passaram pela barbearia (atendimentos CONCLUÍDOS) em cada
// período do dashboard: hoje, ontem, últimos 7 dias, últimos 30 dias e mês
// atual. Cada período vem junto com o período anterior equivalente, para o
// painel mostrar se subiu ou desceu.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  diaLocalDe,
  diasEntre,
  hojeLocal,
  inicioDoMes,
  inicioDoMesAnterior,
  instanteDoDia,
  somarDias,
} from './compartilhado';

export interface Totais {
  atendimentos: number;
  faturamento: number;
}

export interface PeriodoComComparacao extends Totais {
  anterior: Totais;
}

@Injectable()
export class PassagemDeClientes {
  constructor(private readonly prisma: PrismaService) {}

  async executar() {
    const hoje = hojeLocal();
    const amanha = somarDias(hoje, 1);

    // Cada período é [inicio, fimExclusivo) em dias de Brasília; `anterior` é o
    // período imediatamente antes, do mesmo tamanho.
    const mesAtual = inicioDoMes(hoje);
    const mesAnterior = inicioDoMesAnterior(hoje);
    const diasDoMes = diasEntre(mesAtual, amanha);
    const periodos = {
      hoje: {
        de: hoje,
        ate: amanha,
        antesDe: somarDias(hoje, -1),
        antesAte: hoje,
      },
      ontem: {
        de: somarDias(hoje, -1),
        ate: hoje,
        antesDe: somarDias(hoje, -2),
        antesAte: somarDias(hoje, -1),
      },
      ultimos7Dias: {
        de: somarDias(hoje, -6),
        ate: amanha,
        antesDe: somarDias(hoje, -13),
        antesAte: somarDias(hoje, -6),
      },
      ultimos30Dias: {
        de: somarDias(hoje, -29),
        ate: amanha,
        antesDe: somarDias(hoje, -59),
        antesAte: somarDias(hoje, -29),
      },
      // O mês atual é comparado com o mesmo trecho do mês anterior (dia 1 até o
      // mesmo dia), senão o mês corrente sempre perderia para um mês fechado.
      mesAtual: {
        de: mesAtual,
        ate: amanha,
        antesDe: mesAnterior,
        antesAte: somarDias(mesAnterior, diasDoMes),
      },
    };

    const inicioBusca = Object.values(periodos)
      .flatMap((p) => [p.de, p.antesDe])
      .sort()[0];

    const concluidos = await this.prisma.agendamento.findMany({
      where: {
        status: StatusAgendamento.CONCLUIDO,
        dataHora: {
          gte: instanteDoDia(inicioBusca),
          lt: instanteDoDia(amanha),
        },
      },
      select: { dataHora: true, servico: { select: { valor: true } } },
    });

    // Soma por dia (AAAA-MM-DD em Brasília), para depois somar os intervalos.
    const porDia = new Map<string, Totais>();
    for (const a of concluidos) {
      const dia = diaLocalDe(a.dataHora);
      const atual = porDia.get(dia) ?? { atendimentos: 0, faturamento: 0 };
      atual.atendimentos += 1;
      atual.faturamento += Number(a.servico.valor);
      porDia.set(dia, atual);
    }

    const somar = (de: string, ate: string): Totais => {
      const total = { atendimentos: 0, faturamento: 0 };
      for (let dia = de; dia < ate; dia = somarDias(dia, 1)) {
        const t = porDia.get(dia);
        if (t) {
          total.atendimentos += t.atendimentos;
          total.faturamento += t.faturamento;
        }
      }
      return total;
    };
    const arredondar = (t: Totais): Totais => ({
      atendimentos: t.atendimentos,
      faturamento: Math.round(t.faturamento * 100) / 100,
    });

    const resultado = {} as Record<keyof typeof periodos, PeriodoComComparacao>;
    for (const [nome, p] of Object.entries(periodos)) {
      resultado[nome as keyof typeof periodos] = {
        ...arredondar(somar(p.de, p.ate)),
        anterior: arredondar(somar(p.antesDe, p.antesAte)),
      };
    }

    return resultado;
  }
}
