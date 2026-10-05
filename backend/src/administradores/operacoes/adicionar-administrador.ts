// ===== CADASTRAR ADMINISTRADOR =====
// Ctrl+F "CADASTRAR ADMINISTRADOR" para achar este bloco.
// US "Cadastro de Administrador" (item 2.3 da documentação).
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdministradorDto } from '../dto/create-administrador.dto';
import { SELECT_SEM_SENHA, tratarLoginDuplicado } from './compartilhado';

@Injectable()
export class AdicionarAdministrador {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dto: CreateAdministradorDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.administrador.create({
        data: { ...dto, senha: senhaHash },
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw tratarLoginDuplicado(error);
    }
  }
}
