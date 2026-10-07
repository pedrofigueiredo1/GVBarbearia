// ===== ENVIO DE E-MAIL (PROVISORIO) =====
// Ctrl+F "ENVIO DE E-MAIL" para achar este bloco.
// Ainda não há provedor de e-mail configurado (o Resend entra na fase de
// publicação). Por enquanto o conteúdo só é escrito no console do backend,
// simulando o e-mail. Quando o Resend for ligado, só esta classe muda.
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  enviarLinkRecuperacaoSenha(destinatario: string, link: string) {
    this.logger.log(
      `[E-MAIL SIMULADO] Para: ${destinatario} | Link de redefinição de senha (válido por 15 minutos): ${link}`,
    );
  }
}
