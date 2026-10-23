// ===== CONSULTAR HORÁRIOS DISPONÍVEIS =====
// Ctrl+F "CONSULTAR HORÁRIOS DISPONÍVEIS" para achar este bloco.
// US "Seleção de Data e Horário" do cliente (item 2.48): devolve só os horários
// em que o serviço escolhido cabe no expediente da barbearia e em que o
// profissional está livre. Também descarta os que já passaram e os que
// coincidem com outro agendamento do próprio cliente, porque o app não deve
// oferecer um horário que o backend recusaria.
//
// Um agendamento ocupa o intervalo [início, início + duração do serviço), e dois
// intervalos se chocam quando um começa antes de o outro terminar.
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsultarHorariosDisponiveisDto } from '../dto/consultar-horarios-disponiveis.dto';
import {
  dataEHoraLocais,
  horariosDoDia,
  limitesDoDia,
} from '../horario-atendimento';

const MS_POR_MINUTO = 60_000;

@Injectable()
export class ConsultarHorariosDisponiveis {
  constructor(private readonly prisma: PrismaService) {}

  async executar(clienteId: number, dto: ConsultarHorariosDisponiveisDto) {
    const [ano, mes, dia] = dto.data.split('-').map(Number);
    const calendario = new Date(Date.UTC(ano, mes - 1, dia));
    if (
      calendario.getUTCMonth() !== mes - 1 ||
      calendario.getUTCDate() !== dia
    ) {
      throw new BadRequestException('Informe uma data válida.');
    }

    const [servico, profissional] = await Promise.all([
      this.prisma.servico.findUnique({ where: { id: dto.servicoId } }),
      this.prisma.profissional.findUnique({
        where: { id: dto.profissionalId },
      }),
    ]);
    if (!servico) {
      throw new NotFoundException(
        `Serviço com id ${dto.servicoId} não foi encontrado.`,
      );
    }
    if (!profissional) {
      throw new NotFoundException(
        `Profissional com id ${dto.profissionalId} não foi encontrado.`,
      );
    }

    const { inicio, fim } = limitesDoDia(dto.data);
    const ocupados = await this.prisma.agendamento.findMany({
      where: {
        dataHora: { gte: inicio, lt: fim },
        status: { not: StatusAgendamento.CANCELADO },
        OR: [{ profissionalId: dto.profissionalId }, { clienteId }],
      },
      select: { dataHora: true, servico: { select: { duracaoMinutos: true } } },
    });
    const intervalos = ocupados.map((a) => ({
      inicio: a.dataHora.getTime(),
      fim: a.dataHora.getTime() + a.servico.duracaoMinutos * MS_POR_MINUTO,
    }));

    const agora = Date.now();
    const horarios = horariosDoDia(dto.data, servico.duracaoMinutos)
      .filter((comeco) => {
        const inicioNovo = comeco.getTime();
        const fimNovo = inicioNovo + servico.duracaoMinutos * MS_POR_MINUTO;
        if (inicioNovo <= agora) return false;
        return !intervalos.some(
          (o) => inicioNovo < o.fim && o.inicio < fimNovo,
        );
      })
      .map((comeco) => ({
        hora: dataEHoraLocais(comeco).hora,
        dataHora: comeco.toISOString(),
      }));

    return { data: dto.data, horarios };
  }
}
