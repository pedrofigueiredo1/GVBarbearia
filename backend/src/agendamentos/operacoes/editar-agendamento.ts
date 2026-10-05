// ===== EDITAR AGENDAMENTO =====
// Ctrl+F "EDITAR AGENDAMENTO" para achar este bloco.
// US "Edição de Agendamento" (item 2.26 da documentação): permite editar
// data, horário, serviço ou profissional, validando que o novo horário
// está disponível. `status` também é editável aqui — não está nos
// Critérios originais, mas é necessário na prática (ver schema.prisma):
// sem isso, um agendamento nunca chegaria a CONCLUIDO.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAgendamentoDto } from '../dto/update-agendamento.dto';
import { BuscarAgendamento } from './buscar-agendamento';
import {
  INCLUDE_RELACOES,
  ValidarHorarioDisponivel,
  ValidarReferenciasAgendamento,
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

    if (dto.clienteId !== undefined || dto.servicoId !== undefined || dto.profissionalId !== undefined) {
      await this.validarReferencias.executar(
        dto.clienteId ?? atual.cliente.id,
        dto.servicoId ?? atual.servico.id,
        dto.profissionalId ?? atual.profissional.id,
      );
    }

    if (dto.profissionalId !== undefined || dto.dataHora !== undefined) {
      const profissionalId = dto.profissionalId ?? atual.profissional.id;
      const dataHora = dto.dataHora ? new Date(dto.dataHora) : atual.dataHora;
      await this.validarHorarioDisponivel.executar(profissionalId, dataHora, id);
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: {
        ...(dto.clienteId !== undefined && { clienteId: dto.clienteId }),
        ...(dto.servicoId !== undefined && { servicoId: dto.servicoId }),
        ...(dto.profissionalId !== undefined && { profissionalId: dto.profissionalId }),
        ...(dto.dataHora !== undefined && { dataHora: new Date(dto.dataHora) }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: INCLUDE_RELACOES,
    });
  }
}
