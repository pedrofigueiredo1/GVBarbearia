// Opções do envio de foto (multipart/form-data, campo "foto"): sem `storage`, o
// multer guarda o arquivo só na memória; o tamanho é limitado e só passam os
// tipos de imagem aceitos. O conteúdo é conferido de novo, de verdade, em
// ProcessarImagem.
import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  MENSAGEM_FORMATO_DE_FOTO,
  TAMANHO_MAXIMO_BYTES,
  TIPOS_ACEITOS,
} from './operacoes/processar-imagem';

export const opcoesDeUploadDeFoto: MulterOptions = {
  limits: { fileSize: TAMANHO_MAXIMO_BYTES, files: 1 },
  fileFilter: (_req, arquivo, callback) => {
    if (!TIPOS_ACEITOS.includes(arquivo.mimetype)) {
      return callback(new BadRequestException(MENSAGEM_FORMATO_DE_FOTO), false);
    }
    callback(null, true);
  },
};
