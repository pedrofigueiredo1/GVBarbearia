// ===== EDITAR CLIENTE =====
// Ctrl+F "EDITAR CLIENTE" para achar este bloco.
// US "Edição de Cliente" (item 2.22 da documentação). Senha em
// branco/omitida mantém a senha atual — útil pro admin resetar a senha do
// cliente presencialmente, já que a recuperação por e-mail ainda não existe.
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateClienteDto } from '../dto/update-cliente.dto';
import { BuscarCliente } from './buscar-cliente';
import { SELECT_SEM_SENHA, tratarEmailDuplicado } from './compartilhado';

@Injectable()
export class EditarCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarCliente: BuscarCliente,
  ) {}

  async executar(id: number, dto: UpdateClienteDto) {
    await this.buscarCliente.executar(id);

    const { senha, ...resto } = dto;
    const data = senha ? { ...resto, senha: await bcrypt.hash(senha, 10) } : resto;

    try {
      return await this.prisma.cliente.update({
        where: { id },
        data,
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw tratarEmailDuplicado(error);
    }
  }
}
