// ===== EDITAR AGENDAMENTO =====
// Ctrl+F "EDITAR AGENDAMENTO" para achar este bloco.
// US "Edição de Agendamento" (item 2.26 da documentação): permite editar
// data, horário, serviço ou profissional, validando que o novo horário
// está disponível. `status` também é editável aqui — não está nos
// Critérios originais, mas é necessário na prática (ver schema.prisma):
// sem isso, um agendamento nunca chegaria a CONCLUIDO.
import { ConflictException, Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAgendamentoDto } from '../dto/update-agendamento.dto';
import { BuscarAgendamento } from './buscar-agendamento';
import {
  INCLUDE_RELACOES,
  ValidarHorarioDisponivel,
  ValidarReferenciasAgendamento,
  garantirQueNaoEstaConcluido,
  traduzirConflitoDeHorario,
} from './compartilhado';

@Injectable()
export class EditarAgendamento {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAgendamento: BuscarAgendamento,
    private readonly validarReferencias: ValidarReferenciasAgendamento,
    private readonly validarHorarioDisponivel: ValidarHorarioDisponivel,
  ) {}

  async executar(id: number, dto: UpdateAgendamentoDto) {
    const atual = await this.buscarAgendamento.executar(id);

    // Mudar um atendimento concluído para cancelado também é cancelá-lo.
    if (dto.status === StatusAgendamento.CANCELADO) {
      garantirQueNaoEstaConcluido(atual.status);
    }

    // Só se conclui um atendimento que já começou: concluir um horário futuro
    // liberaria avaliação e faturamento de algo que ainda não aconteceu.
    if (dto.status === StatusAgendamento.CONCLUIDO) {
      const quando = dto.dataHora ? new Date(dto.dataHora) : atual.dataHora;
      if (quando.getTime() > Date.now()) {
        throw new ConflictException(
          'Só é possível concluir um atendimento que já começou.',
        );
      }
    }

    if (
      dto.clienteId !== undefined ||
      dto.servicoId !== undefined ||
      dto.profissionalId !== undefined
    ) {
      await this.validarReferencias.executar(
        dto.clienteId ?? atual.cliente.id,
        dto.servicoId ?? atual.servico.id,
        dto.profissionalId ?? atual.profissional.id,
      );
    }

    // Reativar um agendamento cancelado devolve o horário a ele, que pode já
    // ter sido ocupado por outra pessoa: precisa checar de novo.
    const estaReativando =
      atual.status === StatusAgendamento.CANCELADO &&
      dto.status !== undefined &&
      dto.status !== StatusAgendamento.CANCELADO;

    if (
      dto.profissionalId !== undefined ||
      dto.dataHora !== undefined ||
      estaReativando
    ) {
      const profissionalId = dto.profissionalId ?? atual.profissional.id;
      const dataHora = dto.dataHora ? new Date(dto.dataHora) : atual.dataHora;
      await this.validarHorarioDisponivel.executar(
        profissionalId,
        dataHora,
        id,
      );
    }

    try {
      return await this.prisma.agendamento.update({
        where: { id },
        data: {
          ...(dto.clienteId !== undefined && { clienteId: dto.clienteId }),
          ...(dto.servicoId !== undefined && { servicoId: dto.servicoId }),
          ...(dto.profissionalId !== undefined && {
            profissionalId: dto.profissionalId,
          }),
          ...(dto.dataHora !== undefined && {
            dataHora: new Date(dto.dataHora),
          }),
          ...(dto.status !== undefined && { status: dto.status }),
        },
        include: INCLUDE_RELACOES,
      });
    } catch (error) {
      throw traduzirConflitoDeHorario(error);
    }
  }
}
