import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateServicoDto) {
    return this.prisma.servico.create({ data: dto });
  }

  findAll() {
    return this.prisma.servico.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const servico = await this.prisma.servico.findUnique({ where: { id } });

    if (!servico) {
      throw new NotFoundException(`Serviço com id ${id} não foi encontrado.`);
    }

    return servico;
  }

  async update(id: number, dto: UpdateServicoDto) {
    await this.findOne(id);

    return this.prisma.servico.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Regra de negócio da US Exclusão de Serviço: o sistema pode bloquear a
    // exclusão quando há agendamentos futuros vinculados.
    const agendamentoFuturo = await this.prisma.agendamento.findFirst({
      where: {
        servicoId: id,
        dataHora: { gt: new Date() },
        status: { in: [StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO] },
      },
    });

    if (agendamentoFuturo) {
      throw new ConflictException(
        'Não é possível excluir um serviço com agendamentos futuros pendentes ou confirmados.',
      );
    }

    return this.prisma.servico.delete({ where: { id } });
  }
}
