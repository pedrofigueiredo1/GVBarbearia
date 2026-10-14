// ===== CADASTRAR AGENDAMENTO PELO CLIENTE =====
// Ctrl+F "CADASTRAR AGENDAMENTO PELO CLIENTE" para achar este bloco.
// US "Cadastro de Agendamento" do cliente (item 2.49 da documentação): o
// cliente logado reserva um horário. Diferente do cadastro feito pelo
// administrador (que já nasce CONFIRMADO), aqui o agendamento nasce PENDENTE,
// até a barbearia confirmar. O horário precisa estar livre para o profissional
// (mesma regra do painel) e, por ser uma reserva do cliente, precisa ser futuro
// e não pode coincidir com outro agendamento do próprio cliente.
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgendamentoClienteDto } from '../dto/create-agendamento-cliente.dto';
import {
  INCLUDE_RELACOES,
  ValidarHorarioDisponivel,
  ValidarReferenciasAgendamento,
} from './compartilhado';

@Injectable()
export class AdicionarAgendamentoCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validarReferencias: ValidarReferenciasAgendamento,
    private readonly validarHorarioDisponivel: ValidarHorarioDisponivel,
  ) {}

  async executar(clienteId: number, dto: CreateAgendamentoClienteDto) {
    const dataHora = new Date(dto.dataHora);

    if (dataHora <= new Date()) {
      throw new BadRequestException('Escolha uma data e um horário futuros.');
    }

    await this.validarReferencias.executar(
      clienteId,
      dto.servicoId,
      dto.profissionalId,
    );
    await this.validarHorarioDisponivel.executar(dto.profissionalId, dataHora);

    const conflitoDoCliente = await this.prisma.agendamento.findFirst({
      where: {
        clienteId,
        dataHora,
        status: { not: StatusAgendamento.CANCELADO },
      },
    });
    if (conflitoDoCliente) {
      throw new ConflictException(
        'Você já tem um agendamento nesse mesmo horário.',
      );
    }

    return this.prisma.agendamento.create({
      data: {
        clienteId,
        servicoId: dto.servicoId,
        profissionalId: dto.profissionalId,
        dataHora,
        status: StatusAgendamento.PENDENTE,
      },
      include: INCLUDE_RELACOES,
    });
  }
}
