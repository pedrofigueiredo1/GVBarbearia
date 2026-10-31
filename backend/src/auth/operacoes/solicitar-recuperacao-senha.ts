// ===== SOLICITAR RECUPERACAO DE SENHA =====
// Ctrl+F "SOLICITAR RECUPERACAO DE SENHA" para achar este bloco.
// US "Recuperação de Senha de Administrador" (item 2.2 da documentação):
// gera um link de redefinição com validade de 15 minutos. A resposta é sempre
// a mesma, exista o e-mail ou não, para não revelar quais e-mails estão
// cadastrados (regra de negócio da US).
import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { SolicitarRecuperacaoSenhaDto } from '../dto/solicitar-recuperacao-senha.dto';
import {
  INTERVALO_MINIMO_ENTRE_ENVIOS_SEGUNDOS,
  VALIDADE_RECUPERACAO_MINUTOS,
  hashDoToken,
} from './compartilhado';

export const MENSAGEM_RECUPERACAO_GENERICA =
  'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.';

@Injectable()
export class SolicitarRecuperacaoSenha {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async executar({ login }: SolicitarRecuperacaoSenhaDto) {
    const administrador = await this.prisma.administrador.findUnique({
      where: { login },
    });

    // Se um link foi enviado há menos de 1 minuto, não envia outro: evita que
    // alguém inunde a caixa de e-mail do administrador. A resposta é a mesma.
    const enviadoHaPouco =
      administrador?.tokenRecuperacaoExpiraEm &&
      administrador.tokenRecuperacaoExpiraEm.getTime() -
        VALIDADE_RECUPERACAO_MINUTOS * 60_000 >
        Date.now() - INTERVALO_MINIMO_ENTRE_ENVIOS_SEGUNDOS * 1000;

    if (administrador && !enviadoHaPouco) {
      const token = randomBytes(32).toString('hex');
      const expiraEm = new Date(
        Date.now() + VALIDADE_RECUPERACAO_MINUTOS * 60 * 1000,
      );

      await this.prisma.administrador.update({
        where: { id: administrador.id },
        data: {
          tokenRecuperacaoHash: hashDoToken(token),
          tokenRecuperacaoExpiraEm: expiraEm,
        },
      });

      const urlPainel = process.env.ADMIN_URL ?? 'http://localhost:3001';
      // Sem esperar o envio terminar: a resposta demora o mesmo tempo exista o
      // e-mail ou não (senão o tempo revelaria quais e-mails estão cadastrados).
      void this.mail.enviarLinkRecuperacaoSenha(
        administrador.login,
        `${urlPainel}/login/redefinir-senha?token=${token}`,
      );
    }

    return { mensagem: MENSAGEM_RECUPERACAO_GENERICA };
  }
}
