import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfissionalDto } from './dto/create-profissional.dto';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';

@Injectable()
export class ProfissionaisService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProfissionalDto) {
    return this.prisma.profissional.create({ data: dto });
  }

  findAll() {
    return this.prisma.profissional.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const profissional = await this.prisma.profissional.findUnique({
      where: { id },
    });

    if (!profissional) {
      throw new NotFoundException(
        `Profissional com id ${id} não foi encontrado.`,
      );
    }

    return profissional;
  }

  async update(id: number, dto: UpdateProfissionalDto) {
    await this.findOne(id);

    return this.prisma.profissional.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Regra de negócio da US Exclusão de Profissional: o sistema pode
    // impedir a exclusão quando há agendamentos futuros vinculados.
    const agendamentoFuturo = await this.prisma.agendamento.findFirst({
      where: {
        profissionalId: id,
        dataHora: { gt: new Date() },
        status: { in: [StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO] },
      },
    });

    if (agendamentoFuturo) {
      throw new ConflictException(
        'Não é possível excluir um profissional com agendamentos futuros pendentes ou confirmados.',
      );
    }

    return this.prisma.profissional.delete({ where: { id } });
  }
}
