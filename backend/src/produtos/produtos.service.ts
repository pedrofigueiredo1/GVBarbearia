import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto });
  }

  findAll() {
    return this.prisma.produto.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com id ${id} não foi encontrado.`);
    }

    return produto;
  }

  async update(id: number, dto: UpdateProdutoDto) {
    await this.findOne(id);

    return this.prisma.produto.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Diferente de Profissional/Serviço, a US de Exclusão de Produto não
    // prevê bloqueio por vínculo (produto não se associa a agendamentos
    // futuros) — só exige confirmação, já tratada na tela do painel.
    return this.prisma.produto.delete({ where: { id } });
  }
}
