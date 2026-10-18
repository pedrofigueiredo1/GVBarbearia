// ===== EDITAR PERFIL DO CLIENTE =====
// Ctrl+F "EDITAR PERFIL DO CLIENTE" para achar este bloco.
// US "Visualização e Edição de Perfil do Cliente" (item 2.55 da documentação):
// o cliente logado edita o próprio nome, e-mail, telefone e senha. E-mail já
// usado por outro cliente é recusado (409). Por segurança, trocar o e-mail ou
// a senha exige a senha atual: assim, alguém com o celular desbloqueado não
// consegue trocar o e-mail e tomar a conta pela recuperação de senha. A senha
// atual errada devolve 400 (e não 401), para o app não confundir com sessão
// expirada e deslogar o cliente. Diferente de Editar Cliente (usado pelo
// administrador), aqui o próprio cliente nunca altera a conta de outro.
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePerfilClienteDto } from '../dto/update-perfil-cliente.dto';
import { SELECT_SEM_SENHA, tratarEmailDuplicado } from './compartilhado';

@Injectable()
export class EditarPerfilCliente {
  constructor(private readonly prisma: PrismaService) {}

  async executar(clienteId: number, dto: UpdatePerfilClienteDto) {
    const atual = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!atual) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const trocaEmail = dto.email !== undefined && dto.email !== atual.email;
    const trocaSenha = dto.novaSenha !== undefined;

    if (trocaEmail || trocaSenha) {
      const senhaConfere = dto.senhaAtual
        ? await bcrypt.compare(dto.senhaAtual, atual.senha)
        : false;
      if (!senhaConfere) {
        throw new BadRequestException(
          'Informe corretamente a sua senha atual para alterar o e-mail ou a senha.',
        );
      }
    }

    const data = {
      ...(dto.nome !== undefined && { nome: dto.nome }),
      ...(dto.telefone !== undefined && { telefone: dto.telefone }),
      ...(trocaEmail && { email: dto.email }),
      ...(trocaSenha && {
        senha: await bcrypt.hash(dto.novaSenha as string, 10),
      }),
    };

    try {
      return await this.prisma.cliente.update({
        where: { id: clienteId },
        data,
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      throw tratarEmailDuplicado(error);
    }
  }
}
