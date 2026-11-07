// ===== CADASTRAR BLOQUEIO DE AGENDA =====
// Ctrl+F "CADASTRAR BLOQUEIO DE AGENDA" para achar este bloco.
// O administrador fecha a agenda de um dia (ou de um período) para um barbeiro
// ou para todos, por exemplo num feriado ou numa ausência. O app deixa de
// oferecer esses dias e a API recusa novos agendamentos neles. Agendamentos que
// já existiam continuam; a resposta diz quantos são, para o administrador
// resolver cada um (remarcar ou cancelar).
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  dataExisteNoCalendario,
  hojeNaBarbearia,
  limitesDoDia,
} from '../../agendamentos/horario-atendimento';
import { CreateBloqueioAgendaDto } from '../dto/create-bloqueio-agenda.dto';

const MAXIMO_DIAS_BLOQUEADOS = 366;
const MS_POR_DIA = 24 * 60 * 60_000;

@Injectable()
export class AdicionarBloqueioAgenda {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dto: CreateBloqueioAgendaDto) {
    const { dataInicio, dataFim } = dto;
    const profissionalId = dto.profissionalId ?? null;

    if (
      !dataExisteNoCalendario(dataInicio) ||
      !dataExisteNoCalendario(dataFim)
    ) {
      throw new BadRequestException('Informe datas válidas.');
    }
    if (dataFim < dataInicio) {
      throw new BadRequestException(
        'A data final não pode ser anterior à data inicial.',
      );
    }
    if (dataFim < hojeNaBarbearia()) {
      throw new BadRequestException(
        'Não faz sentido bloquear datas que já passaram.',
      );
    }
    const dias =
      (limitesDoDia(dataFim).inicio.getTime() -
        limitesDoDia(dataInicio).inicio.getTime()) /
        MS_POR_DIA +
      1;
    if (dias > MAXIMO_DIAS_BLOQUEADOS) {
      throw new BadRequestException(
        `Um bloqueio pode ter no máximo ${MAXIMO_DIAS_BLOQUEADOS} dias.`,
      );
    }

    if (profissionalId !== null) {
      const profissional = await this.prisma.profissional.findUnique({
        where: { id: profissionalId },
      });
      if (!profissional) {
        throw new NotFoundException(
          `Profissional com id ${profissionalId} não foi encontrado.`,
        );
      }
    }

    const bloqueio = await this.prisma.bloqueioAgenda.create({
      data: { profissionalId, dataInicio, dataFim, motivo: dto.motivo },
      include: { profissional: { select: { id: true, nome: true } } },
    });

    const agendamentosAfetados = await this.prisma.agendamento.count({
      where: {
        status: { not: StatusAgendamento.CANCELADO },
        dataHora: {
          gte: new Date(
            Math.max(limitesDoDia(dataInicio).inicio.getTime(), Date.now()),
          ),
          lt: limitesDoDia(dataFim).fim,
        },
        ...(profissionalId !== null && { profissionalId }),
      },
    });

    return { ...bloqueio, agendamentosAfetados };
  }
}
