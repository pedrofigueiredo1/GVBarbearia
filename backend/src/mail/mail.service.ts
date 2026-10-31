// ===== ENVIO DE E-MAIL (BREVO) =====
// Ctrl+F "ENVIO DE E-MAIL" para achar este bloco.
// Envia os e-mails do sistema (recuperação de senha) pela API transacional da
// Brevo (plano gratuito: 300 e-mails por dia). Variáveis de ambiente:
//   BREVO_API_KEY          chave da API (Brevo > SMTP e API > Chaves de API)
//   MAIL_REMETENTE_EMAIL   remetente JÁ VERIFICADO na Brevo (Remetentes e IPs)
//   MAIL_REMETENTE_NOME    nome que aparece como remetente (padrão: GV Barbearia)
//   BREVO_API_URL          só para testes (padrão: endereço oficial da Brevo)
//
// Sem BREVO_API_KEY ou sem remetente, o e-mail só é escrito no console do
// backend (modo desenvolvimento), então o sistema roda sem conta na Brevo.
//
// Nenhum método lança erro: uma falha de envio é registrada no log e o fluxo
// segue, para a tela de recuperação responder sempre igual (e não revelar quais
// e-mails estão cadastrados).
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

const URL_PADRAO_BREVO = 'https://api.brevo.com/v3/smtp/email';
const COR_COBRE = '#F8B878';
const COR_FUNDO_ESCURO = '#0A0A0B';

interface Mensagem {
  para: string;
  assunto: string;
  html: string;
  texto: string;
}

// Impede que texto vindo de fora quebre o HTML do e-mail.
function esc(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface Modelo {
  titulo: string;
  paragrafos: string[];
  // Bloco em destaque (o código de 6 dígitos).
  destaque?: string;
  botao?: { texto: string; url: string };
  rodape: string;
}

// Monta o e-mail no visual da barbearia (faixa escura com o nome em cobre).
// Só usa estilos inline e tabelas, que é o que os leitores de e-mail aceitam.
function montarHtml({ titulo, paragrafos, destaque, botao, rodape }: Modelo) {
  const textos = paragrafos
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#2b2b31;">${p}</p>`,
    )
    .join('');
  const blocoDestaque = destaque
    ? `<div style="margin:8px 0 24px;padding:18px;background:${COR_FUNDO_ESCURO};border-radius:12px;text-align:center;font-family:'Courier New',monospace;font-size:36px;font-weight:bold;letter-spacing:10px;color:${COR_COBRE};">${esc(destaque)}</div>`
    : '';
  const blocoBotao = botao
    ? `<p style="margin:8px 0 24px;text-align:center;"><a href="${esc(botao.url)}" style="display:inline-block;padding:14px 28px;background:${COR_COBRE};color:#1A1208;font-weight:bold;font-size:16px;text-decoration:none;border-radius:10px;">${esc(botao.texto)}</a></p>
       <p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#6b6b73;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="word-break:break-all;">${esc(botao.url)}</span></p>`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px 12px;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;">
          <tr><td style="padding:22px;background:${COR_FUNDO_ESCURO};text-align:center;font-size:20px;font-weight:bold;letter-spacing:4px;color:${COR_COBRE};">GV BARBEARIA</td></tr>
          <tr><td style="padding:28px 28px 12px;">
            <h1 style="margin:0 0 18px;font-size:22px;color:#0A0A0B;">${esc(titulo)}</h1>
            ${textos}${blocoDestaque}${blocoBotao}
          </td></tr>
          <tr><td style="padding:0 28px 28px;font-size:13px;line-height:20px;color:#6b6b73;">${rodape}</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  // O cliente recebe um código de 6 dígitos para digitar no app.
  enviarCodigoRecuperacaoSenha(destinatario: string, codigo: string) {
    return this.enviar({
      para: destinatario,
      assunto: 'Seu código para redefinir a senha - GV Barbearia',
      html: montarHtml({
        titulo: 'Redefinir sua senha',
        paragrafos: [
          'Recebemos um pedido para redefinir a senha da sua conta no app da GV Barbearia.',
          'Digite este código no app. Ele vale por <strong>15 minutos</strong>:',
        ],
        destaque: codigo,
        rodape:
          'Se você não pediu, ignore este e-mail: sua senha continua a mesma. Nunca compartilhe este código com ninguém.',
      }),
      texto: `GV Barbearia\n\nSeu código para redefinir a senha: ${codigo}\nEle vale por 15 minutos.\n\nSe você não pediu, ignore este e-mail. Nunca compartilhe este código.`,
    });
  }

  // O administrador recebe um link para criar a nova senha no painel.
  enviarLinkRecuperacaoSenha(destinatario: string, link: string) {
    return this.enviar({
      para: destinatario,
      assunto: 'Redefinir a senha do painel - GV Barbearia',
      html: montarHtml({
        titulo: 'Redefinir a senha do painel',
        paragrafos: [
          'Recebemos um pedido para redefinir a senha de acesso ao painel administrativo da GV Barbearia.',
          'Clique no botão abaixo para criar uma nova senha. O link vale por <strong>15 minutos</strong> e só pode ser usado uma vez.',
        ],
        botao: { texto: 'Criar nova senha', url: link },
        rodape:
          'Se você não pediu, ignore este e-mail: sua senha continua a mesma.',
      }),
      texto: `GV Barbearia\n\nPara redefinir a senha do painel, abra este link (vale por 15 minutos e só pode ser usado uma vez):\n${link}\n\nSe você não pediu, ignore este e-mail.`,
    });
  }

  // Aviso de segurança depois que a senha é trocada: se não foi a própria
  // pessoa, ela fica sabendo na hora.
  enviarSenhaAlterada(destinatario: string) {
    return this.enviar({
      para: destinatario,
      assunto: 'Sua senha foi alterada - GV Barbearia',
      html: montarHtml({
        titulo: 'Sua senha foi alterada',
        paragrafos: [
          'A senha da sua conta na GV Barbearia acabou de ser alterada.',
          'Se foi você, não precisa fazer nada. Se <strong>não</strong> foi, peça uma nova redefinição de senha imediatamente e avise a barbearia.',
        ],
        rodape: 'Este é um aviso automático de segurança.',
      }),
      texto:
        'GV Barbearia\n\nA senha da sua conta acabou de ser alterada. Se não foi você, peça uma nova redefinição de senha imediatamente e avise a barbearia.',
    });
  }

  // Lê as variáveis tirando espaços e quebras de linha: uma chave colada no
  // .env com uma quebra de linha no meio ou no fim é um erro comum, e a Brevo
  // recusaria o pedido.
  private configuracao() {
    return {
      chave: (process.env.BREVO_API_KEY ?? '').replace(/\s+/g, ''),
      remetenteEmail: (process.env.MAIL_REMETENTE_EMAIL ?? '').trim(),
    };
  }

  // Ao ligar o backend, avisa no log se os e-mails vão sair de verdade pela
  // Brevo ou só aparecer no console.
  onModuleInit() {
    const { chave, remetenteEmail } = this.configuracao();
    if (chave && remetenteEmail) {
      this.logger.log(
        `E-mail pela Brevo ligado (remetente: ${remetenteEmail}).`,
      );
    } else {
      this.logger.warn(
        'E-mail da Brevo NÃO configurado (faltam BREVO_API_KEY e/ou MAIL_REMETENTE_EMAIL no .env): os e-mails só aparecem aqui no console.',
      );
    }
  }

  // Devolve true se o e-mail foi aceito pela Brevo (ou escrito no console, no
  // modo desenvolvimento) e false se falhou. Nunca lança erro.
  private async enviar(mensagem: Mensagem): Promise<boolean> {
    const { chave, remetenteEmail } = this.configuracao();

    if (!chave || !remetenteEmail) {
      this.logger.log(
        `[E-MAIL SIMULADO - sem BREVO_API_KEY] Para: ${mensagem.para} | Assunto: ${mensagem.assunto}\n${mensagem.texto}`,
      );
      return true;
    }

    const corpo = JSON.stringify({
      sender: {
        name: process.env.MAIL_REMETENTE_NOME ?? 'GV Barbearia',
        email: remetenteEmail,
      },
      to: [{ email: mensagem.para }],
      subject: mensagem.assunto,
      htmlContent: mensagem.html,
      textContent: mensagem.texto,
    });

    // Uma nova tentativa se a Brevo estiver fora do ar ou a rede falhar (erro
    // 5xx ou sem resposta). Erros 4xx (chave errada, remetente não verificado)
    // não adianta repetir.
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      try {
        const resposta = await fetch(
          process.env.BREVO_API_URL ?? URL_PADRAO_BREVO,
          {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              'api-key': chave,
            },
            body: corpo,
            signal: AbortSignal.timeout(10_000),
          },
        );

        if (resposta.ok) {
          this.logger.log(
            `E-mail "${mensagem.assunto}" aceito pela Brevo para ${mensagem.para}.`,
          );
          return true;
        }

        const detalhe = (await resposta.text().catch(() => '')).slice(0, 300);
        this.logger.error(
          `Brevo recusou o e-mail para ${mensagem.para} (HTTP ${resposta.status}): ${detalhe}`,
        );
        if (resposta.status < 500) return false;
      } catch (erro) {
        this.logger.error(
          `Falha de rede ao enviar e-mail para ${mensagem.para} (tentativa ${tentativa}): ${(erro as Error).message}`,
        );
      }
      if (tentativa < 2) await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
  }
}
