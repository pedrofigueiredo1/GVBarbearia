// ===== EDITAR ADMINISTRADOR =====
// Ctrl+F "EDITAR ADMINISTRADOR" para achar este bloco.
// US "Edição de Administrador" (item 2.5 da documentação).
// Senha em branco/omitida mantém a senha atual — só é trocada quando o
// admin explicitamente informa uma nova.
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAdministradorDto } from '../dto/update-administrador.dto';
import { BuscarAdministrador } from './buscar-administrador';
import { SELECT_SEM_SENHA, tratarLoginDuplicado } from './compartilhado';

@Injectable()
export class EditarAdministrador {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAdministrador: BuscarAdministrador,
  ) {}

  async executar(id: number, dto: UpdateAdministradorDto) {
    await this.buscarAdministrador.executar(id);

    const { senha, ...resto } = dto;
    const data = senha ? { ...resto, senha: await bcrypt.hash(senha, 10) } : resto;

    try {
      return await this.prisma.administrador.update({
        where: { id },
        data,
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw tratarLoginDuplicado(error);
    }
  }
}
