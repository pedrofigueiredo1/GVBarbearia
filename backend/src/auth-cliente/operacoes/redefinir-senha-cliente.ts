// ===== REDEFINIR SENHA DO CLIENTE =====
// Ctrl+F "REDEFINIR SENHA DO CLIENTE" para achar este bloco.
// US "Recuperação de Senha de Cliente" (item 2.39 da documentação): só conclui
// com o código enviado ao e-mail cadastrado, dentro dos 15 minutos e de até 5
// tentativas. O código vale uma vez só. E-mail inexistente, código errado e
// código expirado recebem a mesma resposta, para não revelar cadastros.
import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RedefinirSenhaClienteDto } from '../dto/redefinir-senha-cliente.dto';
import { MAXIMO_TENTATIVAS_CODIGO, hashDoCodigo } from './compartilhado';

const MENSAGEM_INVALIDO =
  'Código inválido ou expirado. Solicite um novo código.';

@Injectable()
export class RedefinirSenhaCliente {
  constructor(private readonly prisma: PrismaService) {}

  async executar({ email, codigo, novaSenha }: RedefinirSenhaClienteDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { email } });

    if (
      !cliente ||
      !cliente.codigoRecuperacaoHash ||
      !cliente.codigoRecuperacaoExpiraEm ||
      cliente.codigoRecuperacaoExpiraEm <= new Date()
    ) {
      throw new BadRequestException(MENSAGEM_INVALIDO);
    }

    // Toda tentativa conta, certa ou errada, e o incremento é feito direto no
    // banco (atômico) para valer mesmo com várias tentativas ao mesmo tempo.
    const { tentativasRecuperacao } = await this.prisma.cliente.update({
      where: { id: cliente.id },
      data: { tentativasRecuperacao: { increment: 1 } },
      select: { tentativasRecuperacao: true },
    });

    if (tentativasRecuperacao > MAXIMO_TENTATIVAS_CODIGO) {
      await this.prisma.cliente.update({
        where: { id: cliente.id },
        data: { codigoRecuperacaoHash: null, codigoRecuperacaoExpiraEm: null },
      });
      throw new BadRequestException(MENSAGEM_INVALIDO);
    }

    const informado = Buffer.from(hashDoCodigo(cliente.id, codigo));
    const salvo = Buffer.from(cliente.codigoRecuperacaoHash);
    if (
      informado.length !== salvo.length ||
      !timingSafeEqual(informado, salvo)
    ) {
      throw new BadRequestException(MENSAGEM_INVALIDO);
    }

    await this.prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        senha: await bcrypt.hash(novaSenha, 10),
        codigoRecuperacaoHash: null,
        codigoRecuperacaoExpiraEm: null,
        tentativasRecuperacao: 0,
      },
    });

    return {
      mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.',
    };
  }
}
