// ===== CADASTRAR AGENDAMENTO =====
// Ctrl+F "CADASTRAR AGENDAMENTO" para achar este bloco.
// Cadastro pelo admin (não documentado nas US originais — mesma lógica do
// cadastro presencial de Cliente): quando o administrador registra um
// agendamento presencialmente, ele já nasce CONFIRMADO (diferente do fluxo
// do cliente pelo app, que nasceria PENDENTE até a barbearia confirmar).
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgendamentoDto } from '../dto/create-agendamento.dto';
import {
  INCLUDE_RELACOES,
  ValidarHorarioDisponivel,
  ValidarReferenciasAgendamento,
  traduzirConflitoDeHorario,
} from './compartilhado';

@Injectable()
export class AdicionarAgendamento {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validarReferencias: ValidarReferenciasAgendamento,
    private readonly validarHorarioDisponivel: ValidarHorarioDisponivel,
  ) {}

  async executar(dto: CreateAgendamentoDto) {
    await this.validarReferencias.executar(
      dto.clienteId,
      dto.servicoId,
      dto.profissionalId,
    );
    await this.validarHorarioDisponivel.executar(
      dto.profissionalId,
      dto.dataHora,
    );

    try {
      return await this.prisma.agendamento.create({
        data: {
          clienteId: dto.clienteId,
          servicoId: dto.servicoId,
          profissionalId: dto.profissionalId,
          dataHora: new Date(dto.dataHora),
          status: StatusAgendamento.CONFIRMADO,
        },
        include: INCLUDE_RELACOES,
      });
    } catch (error) {
      // Duas pessoas no mesmo horário ao mesmo tempo: o índice do banco barra.
      throw traduzirConflitoDeHorario(error);
    }
  }
}
