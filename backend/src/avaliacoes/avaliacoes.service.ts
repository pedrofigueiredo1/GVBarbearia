import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

// A US Consulta de Avaliação exige exibir "autor, nota e comentário" — o
// autor vem do cliente do agendamento vinculado.
const INCLUDE_AGENDAMENTO = {
  agendamento: {
    select: {
      id: true,
      dataHora: true,
      cliente: { select: { id: true, nome: true } },
      servico: { select: { id: true, nome: true } },
      profissional: { select: { id: true, nome: true } },
    },
  },
};

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.avaliacao.findMany({
      include: INCLUDE_AGENDAMENTO,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: number) {
    const avaliacao = await this.prisma.avaliacao.findUnique({
      where: { id },
      include: INCLUDE_AGENDAMENTO,
    });

    if (!avaliacao) {
      throw new NotFoundException(`Avaliação com id ${id} não foi encontrada.`);
    }

    return avaliacao;
  }

  async update(id: number, dto: UpdateAvaliacaoDto) {
    await this.findOne(id);

    return this.prisma.avaliacao.update({
      where: { id },
      data: dto,
      include: INCLUDE_AGENDAMENTO,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.avaliacao.delete({ where: { id } });
  }
}
