// ===== CADASTRAR AGENDAMENTO PELO CLIENTE =====
// Ctrl+F "CADASTRAR AGENDAMENTO PELO CLIENTE" para achar este bloco.
// US "Cadastro de Agendamento" do cliente (item 2.49 da documentação): o
// cliente logado reserva um horário. Diferente do cadastro feito pelo
// administrador (que já nasce CONFIRMADO), aqui o agendamento nasce PENDENTE,
// até a barbearia confirmar. O horário precisa estar livre para o profissional
// (mesma regra do painel) e, por ser uma reserva do cliente, precisa ser futuro
// e não pode coincidir com outro agendamento do próprio cliente. Também precisa
// ser um dos horários da grade da barbearia (dentro do expediente, com o
// serviço cabendo até o fim do período) e não pode invadir o tempo de outro
// atendimento do profissional.
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgendamentoClienteDto } from '../dto/create-agendamento-cliente.dto';
import { dataEHoraLocais, estaNaGrade } from '../horario-atendimento';
import { ConsultarHorariosDisponiveis } from './consultar-horarios-disponiveis';
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
    private readonly consultarHorariosDisponiveis: ConsultarHorariosDisponiveis,
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
    const servico = await this.prisma.servico.findUniqueOrThrow({
      where: { id: dto.servicoId },
    });
    if (!estaNaGrade(dataHora, servico.duracaoMinutos)) {
      throw new BadRequestException(
        'Esse horário está fora do horário de atendimento da barbearia.',
      );
    }

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

    // Mesmo começando em horário diferente, o atendimento não pode invadir o de
    // outro (do profissional ou do cliente).
    const { horarios } = await this.consultarHorariosDisponiveis.executar(
      clienteId,
      {
        servicoId: dto.servicoId,
        profissionalId: dto.profissionalId,
        data: dataEHoraLocais(dataHora).data,
      },
    );
    if (!horarios.some((h) => h.dataHora === dataHora.toISOString())) {
      throw new ConflictException(
        'Esse horário não está mais disponível. Escolha outro horário.',
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
