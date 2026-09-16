import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

// A senha (hash) nunca deve sair da API — todo retorno usa este `select`
// explícito em vez de devolver o registro inteiro do Prisma.
const SELECT_SEM_SENHA = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.ClienteSelect;

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.cliente.create({
        data: { ...dto, senha: senhaHash },
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw this.tratarEmailDuplicado(error);
    }
  }

  findAll() {
    return this.prisma.cliente.findMany({
      select: SELECT_SEM_SENHA,
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      select: SELECT_SEM_SENHA,
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com id ${id} não foi encontrado.`);
    }

    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);

    const { senha, ...resto } = dto;
    const data = senha ? { ...resto, senha: await bcrypt.hash(senha, 10) } : resto;

    try {
      return await this.prisma.cliente.update({
        where: { id },
        data,
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw this.tratarEmailDuplicado(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    // Regra de negócio da US Exclusão de Cliente: o sistema deve impedir a
    // exclusão de cliente com agendamento pendente ou confirmado vinculado.
    // Esse vínculo ainda não existe no banco (módulo de Agendamentos vem em
    // uma etapa posterior do cronograma) — quando ele for criado, uma
    // checagem de agendamentos pendentes/confirmados deve entrar aqui antes
    // do delete, lançando ConflictException se houver algum.
    return this.prisma.cliente.delete({
      where: { id },
      select: SELECT_SEM_SENHA,
    });
  }

  private tratarEmailDuplicado(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Este e-mail já está em uso por outro cliente.');
    }
    return error;
  }
}
