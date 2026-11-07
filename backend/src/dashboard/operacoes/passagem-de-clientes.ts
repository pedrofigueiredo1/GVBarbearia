// ===== PASSAGEM DE CLIENTES =====
// Ctrl+F "PASSAGEM DE CLIENTES" para achar este bloco.
// Quantos clientes passaram pela barbearia (atendimentos CONCLUÍDOS) em cada
// período do dashboard: hoje, ontem, últimos 7 dias, últimos 30 dias e mês
// atual, sem comparação com períodos anteriores.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  diaLocalDe,
  hojeLocal,
  inicioDoMes,
  instanteDoDia,
  somarDias,
} from './compartilhado';

export interface Totais {
  atendimentos: number;
  faturamento: number;
}

@Injectable()
export class PassagemDeClientes {
  constructor(private readonly prisma: PrismaService) {}

  async executar() {
    const hoje = hojeLocal();
    const amanha = somarDias(hoje, 1);

    // Cada período é [de, ate) em dias de Brasília.
    const periodos = {
      hoje: { de: hoje, ate: amanha },
      ontem: { de: somarDias(hoje, -1), ate: hoje },
      ultimos7Dias: { de: somarDias(hoje, -6), ate: amanha },
      ultimos30Dias: { de: somarDias(hoje, -29), ate: amanha },
      mesAtual: { de: inicioDoMes(hoje), ate: amanha },
    };

    const inicioBusca = Object.values(periodos)
      .map((p) => p.de)
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

    const resultado = {} as Record<keyof typeof periodos, Totais>;
    for (const [nome, p] of Object.entries(periodos)) {
      resultado[nome as keyof typeof periodos] = arredondar(somar(p.de, p.ate));
    }

    return resultado;
  }
}
