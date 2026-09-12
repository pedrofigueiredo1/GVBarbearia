import { Injectable, NotFoundException } from '@nestjs/common';
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
    // Esse vínculo ainda não existe no banco (módulo de Agendamentos vem
    // em uma etapa posterior do cronograma) — quando ele for criado, um
    // `count` de agendamentos futuros deve ser checado aqui antes do delete.
    return this.prisma.profissional.delete({ where: { id } });
  }
}
