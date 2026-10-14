// ===== CANCELAR AGENDAMENTO PELO CLIENTE =====
// Ctrl+F "CANCELAR AGENDAMENTO PELO CLIENTE" para achar este bloco.
// US "Cancelamento de Agendamento pelo Cliente" (item 2.53 da documentação).
// Regras: só o cliente dono do agendamento cancela; só agendamento futuro e
// ainda ativo (pendente ou confirmado); e com no mínimo 2 horas de
// antecedência. Cancelar não apaga o registro: muda o status para CANCELADO,
// o que também libera o horário do profissional. (O cancelamento feito pelo
// administrador, no painel, não tem a regra das 2 horas.)
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarAgendamento } from './buscar-agendamento';
import { INCLUDE_RELACOES } from './compartilhado';

export const ANTECEDENCIA_MINIMA_CANCELAMENTO_HORAS = 2;

@Injectable()
export class CancelarAgendamentoCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAgendamento: BuscarAgendamento,
  ) {}

  async executar(clienteId: number, id: number) {
    const agendamento = await this.buscarAgendamento.executar(id);

    if (agendamento.clienteId !== clienteId) {
      throw new ForbiddenException(
        'Você só pode cancelar os seus próprios agendamentos.',
      );
    }

    const statusAtivos: StatusAgendamento[] = [
      StatusAgendamento.PENDENTE,
      StatusAgendamento.CONFIRMADO,
    ];
    if (!statusAtivos.includes(agendamento.status)) {
      throw new ConflictException(
        'Este agendamento não pode mais ser cancelado.',
      );
    }

    const antecedenciaMs = agendamento.dataHora.getTime() - Date.now();
    if (antecedenciaMs <= 0) {
      throw new BadRequestException(
        'Não é possível cancelar um agendamento que já passou.',
      );
    }
    if (
      antecedenciaMs <
      ANTECEDENCIA_MINIMA_CANCELAMENTO_HORAS * 60 * 60 * 1000
    ) {
      throw new BadRequestException(
        `O prazo mínimo de ${ANTECEDENCIA_MINIMA_CANCELAMENTO_HORAS} horas de antecedência não foi respeitado.`,
      );
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: { status: StatusAgendamento.CANCELADO },
      include: INCLUDE_RELACOES,
    });
  }
}
