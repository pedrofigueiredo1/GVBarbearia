// ===== REDEFINIR SENHA =====
// Ctrl+F "REDEFINIR SENHA" para achar este bloco.
// US "Recuperação de Senha de Administrador" (item 2.2 da documentação): só
// conclui com o link enviado por e-mail e dentro dos 15 minutos de validade.
// O token vale uma vez só — é apagado assim que a senha é trocada.
import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RedefinirSenhaDto } from '../dto/redefinir-senha.dto';
import { hashDoToken } from './compartilhado';

@Injectable()
export class RedefinirSenha {
  constructor(private readonly prisma: PrismaService) {}

  async executar({ token, novaSenha }: RedefinirSenhaDto) {
    const administrador = await this.prisma.administrador.findFirst({
      where: {
        tokenRecuperacaoHash: hashDoToken(token),
        tokenRecuperacaoExpiraEm: { gt: new Date() },
      },
    });

    if (!administrador) {
      throw new BadRequestException(
        'Link de redefinição inválido ou expirado. Solicite um novo.',
      );
    }

    await this.prisma.administrador.update({
      where: { id: administrador.id },
      data: {
        senha: await bcrypt.hash(novaSenha, 10),
        tokenRecuperacaoHash: null,
        tokenRecuperacaoExpiraEm: null,
      },
    });

    return { mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.' };
  }
}
