import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';

// A senha (hash) nunca deve sair da API — todo retorno usa este `select`
// explícito em vez de devolver o registro inteiro do Prisma.
const SELECT_SEM_SENHA = {
  id: true,
  nome: true,
  login: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.AdministradorSelect;

@Injectable()
export class AdministradoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdministradorDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.administrador.create({
        data: { ...dto, senha: senhaHash },
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw this.tratarLoginDuplicado(error);
    }
  }

  findAll() {
    return this.prisma.administrador.findMany({
      select: SELECT_SEM_SENHA,
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { id },
      select: SELECT_SEM_SENHA,
    });

    if (!administrador) {
      throw new NotFoundException(`Administrador com id ${id} não foi encontrado.`);
    }

    return administrador;
  }

  async update(id: number, dto: UpdateAdministradorDto) {
    await this.findOne(id);

    const { senha, ...resto } = dto;
    const data = senha ? { ...resto, senha: await bcrypt.hash(senha, 10) } : resto;

    try {
      return await this.prisma.administrador.update({
        where: { id },
        data,
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw this.tratarLoginDuplicado(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    // A US de Exclusão de Administrador não define regra de bloqueio por
    // vínculo (diferente de Profissional/Serviço) — só exige confirmação,
    // já tratada na tela do painel.
    return this.prisma.administrador.delete({
      where: { id },
      select: SELECT_SEM_SENHA,
    });
  }

  private tratarLoginDuplicado(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException('Este login já está em uso por outro administrador.');
    }
    return error;
  }
}
