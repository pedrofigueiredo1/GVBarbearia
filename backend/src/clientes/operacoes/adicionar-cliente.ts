// ===== CADASTRAR CLIENTE =====
// Ctrl+F "CADASTRAR CLIENTE" para achar este bloco.
// Regra de negócio adicional (não presente nas US originais, alinhada com
// Pedro): o administrador também pode cadastrar clientes presencialmente —
// por exemplo, alguém que prefere ser atendido na barbearia em vez de usar
// o app. A senha definida aqui permite que a mesma conta seja usada depois
// para login no app, quando essa funcionalidade existir.
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { SELECT_SEM_SENHA, tratarEmailDuplicado } from './compartilhado';

@Injectable()
export class AdicionarCliente {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dto: CreateClienteDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.cliente.create({
        data: { ...dto, senha: senhaHash },
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw tratarEmailDuplicado(error);
    }
  }
}
