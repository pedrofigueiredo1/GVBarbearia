import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

const INCLUDE_RELACOES = {
  cliente: { select: { id: true, nome: true, email: true, telefone: true } },
  servico: { select: { id: true, nome: true, valor: true, duracaoMinutos: true } },
  profissional: { select: { id: true, nome: true, especialidade: true } },
};

@Injectable()
export class AgendamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAgendamentoDto) {
    await this.validarReferencias(dto.clienteId, dto.servicoId, dto.profissionalId);
    await this.validarHorarioDisponivel(dto.profissionalId, dto.dataHora);

    return this.prisma.agendamento.create({
      data: {
        clienteId: dto.clienteId,
        servicoId: dto.servicoId,
        profissionalId: dto.profissionalId,
        dataHora: new Date(dto.dataHora),
        // Decisão de negócio (não documentada nas US originais): agendamento
        // cadastrado pelo admin já nasce confirmado, pois foi combinado
        // presencialmente com o cliente — diferente do fluxo pelo app, que
        // nasceria pendente até a barbearia confirmar.
        status: StatusAgendamento.CONFIRMADO,
      },
      include: INCLUDE_RELACOES,
    });
  }

  findAll() {
    return this.prisma.agendamento.findMany({
      include: INCLUDE_RELACOES,
      orderBy: { dataHora: 'asc' },
    });
  }

  async findOne(id: number) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
      include: INCLUDE_RELACOES,
    });

    if (!agendamento) {
      throw new NotFoundException(`Agendamento com id ${id} não foi encontrado.`);
    }

    return agendamento;
  }

  async update(id: number, dto: UpdateAgendamentoDto) {
    const atual = await this.findOne(id);

    if (dto.clienteId !== undefined || dto.servicoId !== undefined || dto.profissionalId !== undefined) {
      await this.validarReferencias(
        dto.clienteId ?? atual.cliente.id,
        dto.servicoId ?? atual.servico.id,
        dto.profissionalId ?? atual.profissional.id,
      );
    }

    if (dto.profissionalId !== undefined || dto.dataHora !== undefined) {
      const profissionalId = dto.profissionalId ?? atual.profissional.id;
      const dataHora = dto.dataHora ? new Date(dto.dataHora) : atual.dataHora;
      await this.validarHorarioDisponivel(profissionalId, dataHora, id);
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

  async cancelar(id: number) {
    await this.findOne(id);

    // "Exclusão de Agendamento" na documentação é, na prática, um
    // cancelamento (ver comentário no schema.prisma) — atualiza o status em
    // vez de remover o registro, preservando o histórico para os relatórios.
    return this.prisma.agendamento.update({
      where: { id },
      data: { status: StatusAgendamento.CANCELADO },
      include: INCLUDE_RELACOES,
    });
  }

  private async validarReferencias(
    clienteId: number,
    servicoId: number,
    profissionalId: number,
  ) {
    const [cliente, servico, profissional] = await Promise.all([
      this.prisma.cliente.findUnique({ where: { id: clienteId } }),
      this.prisma.servico.findUnique({ where: { id: servicoId } }),
      this.prisma.profissional.findUnique({ where: { id: profissionalId } }),
    ]);

    if (!cliente) {
      throw new NotFoundException(`Cliente com id ${clienteId} não foi encontrado.`);
    }
    if (!servico) {
      throw new NotFoundException(`Serviço com id ${servicoId} não foi encontrado.`);
    }
    if (!profissional) {
      throw new NotFoundException(`Profissional com id ${profissionalId} não foi encontrado.`);
    }
  }

  private async validarHorarioDisponivel(
    profissionalId: number,
    dataHora: Date | string,
    ignorarId?: number,
  ) {
    // Regra de negócio: "não deve permitir dois agendamentos no mesmo
    // horário para o mesmo profissional". Um agendamento cancelado libera o
    // horário, por isso fica de fora dessa checagem.
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        profissionalId,
        dataHora: new Date(dataHora),
        status: { not: StatusAgendamento.CANCELADO },
        ...(ignorarId !== undefined && { id: { not: ignorarId } }),
      },
    });

    if (conflito) {
      throw new ConflictException(
        'Este profissional já tem um agendamento nesse mesmo horário.',
      );
    }
  }
}
