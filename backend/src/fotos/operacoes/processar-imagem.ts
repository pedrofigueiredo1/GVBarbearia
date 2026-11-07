// ===== PROCESSAR IMAGEM =====
// Ctrl+F "PROCESSAR IMAGEM" para achar este bloco.
// Deixa toda foto de profissional ou de produto no mesmo formato, qualquer que
// seja o arquivo enviado: 600 x 800 pixels (proporção 3:4, em pé), JPEG. É
// assim que as fotos têm sempre o mesmo tamanho no app e no painel, sem uma
// ficar maior que a outra. A imagem é recortada cobrindo todo o quadro
// (priorizando a parte mais marcante, como o rosto) e nunca é esticada.
import { BadRequestException, Injectable } from '@nestjs/common';
import sharp = require('sharp');

export const LARGURA_FOTO = 600;
export const ALTURA_FOTO = 800;
export const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024;
export const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

// Um arquivo com extensão de imagem mas conteúdo de outra coisa é recusado
// aqui: o sharp lê o conteúdo de verdade, não confia no tipo informado.
const FORMATOS_ACEITOS = ['jpeg', 'png', 'webp'];
export const MENSAGEM_FORMATO_DE_FOTO =
  'Envie uma imagem nos formatos JPG, PNG ou WebP, de até 8 MB.';

@Injectable()
export class ProcessarImagem {
  async executar(arquivo: Buffer) {
    try {
      const { format } = await sharp(arquivo).metadata();
      if (!format || !FORMATOS_ACEITOS.includes(format)) {
        throw new BadRequestException(MENSAGEM_FORMATO_DE_FOTO);
      }

      const conteudo = await sharp(arquivo)
        .rotate() // respeita a orientação gravada pela câmera do celular
        .resize(LARGURA_FOTO, ALTURA_FOTO, {
          fit: 'cover',
          position: sharp.strategy.attention,
        })
        .flatten({ background: '#ffffff' }) // PNG com transparência vira fundo branco
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();

      return { conteudo: new Uint8Array(conteudo), tipoMime: 'image/jpeg' };
    } catch (erro) {
      if (erro instanceof BadRequestException) throw erro;
      throw new BadRequestException(MENSAGEM_FORMATO_DE_FOTO);
    }
  }
}
