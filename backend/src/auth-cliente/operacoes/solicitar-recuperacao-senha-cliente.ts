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
import {
  INTERVALO_MINIMO_ENTRE_ENVIOS_SEGUNDOS,
  VALIDADE_CODIGO_MINUTOS,
  hashDoCodigo,
} from './compartilhado';

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

    // Se um código foi enviado há menos de 1 minuto, não envia outro: evita que
    // alguém inunde a caixa de e-mail do cliente. A resposta é a mesma.
    const enviadoHaPouco =
      cliente?.codigoRecuperacaoExpiraEm &&
      cliente.codigoRecuperacaoExpiraEm.getTime() -
        VALIDADE_CODIGO_MINUTOS * 60_000 >
        Date.now() - INTERVALO_MINIMO_ENTRE_ENVIOS_SEGUNDOS * 1000;

    if (cliente && !enviadoHaPouco) {
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

      // Sem esperar o envio terminar: a resposta demora o mesmo tempo exista o
      // e-mail ou não (senão o tempo revelaria quais e-mails estão cadastrados).
      void this.mail.enviarCodigoRecuperacaoSenha(cliente.email, codigo);
    }

    return { mensagem: MENSAGEM_CODIGO_GENERICA };
  }
}
