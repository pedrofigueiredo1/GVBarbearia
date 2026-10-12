// ===== SOLICITAR RECUPERACAO DE SENHA DO CLIENTE =====
// Ctrl+F "SOLICITAR RECUPERACAO DE SENHA DO CLIENTE" para achar este bloco.
// US "Recuperação de Senha de Cliente" (item 2.39 da documentação): gera um
// código de 6 dígitos com validade de 15 minutos. A resposta é sempre a mesma,
// exista o e-mail ou não, para não revelar quais e-mails estão cadastrados
// (regra de negócio da US, CT02).
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { SolicitarRecuperacaoSenhaClienteDto } from '../dto/solicitar-recuperacao-senha-cliente.dto';
import { VALIDADE_CODIGO_MINUTOS, hashDoCodigo } from './compartilhado';

export const MENSAGEM_CODIGO_GENERICA =
  'Se o e-mail estiver cadastrado, você receberá um código para redefinir a senha.';

@Injectable()
export class SolicitarRecuperacaoSenhaCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async executar({ email }: SolicitarRecuperacaoSenhaClienteDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { email } });

    if (cliente) {
      const codigo = randomInt(0, 1_000_000).toString().padStart(6, '0');

      await this.prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          codigoRecuperacaoHash: hashDoCodigo(cliente.id, codigo),
          codigoRecuperacaoExpiraEm: new Date(
            Date.now() + VALIDADE_CODIGO_MINUTOS * 60 * 1000,
          ),
          tentativasRecuperacao: 0,
        },
      });

      this.mail.enviarCodigoRecuperacaoSenha(cliente.email, codigo);
    }

    return { mensagem: MENSAGEM_CODIGO_GENERICA };
  }
}
