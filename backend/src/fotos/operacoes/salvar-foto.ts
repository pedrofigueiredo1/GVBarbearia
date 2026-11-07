// ===== SALVAR FOTO =====
// Ctrl+F "SALVAR FOTO" para achar este bloco.
// Troca (ou coloca) a foto de um profissional ou produto. A imagem enviada é
// primeiro padronizada (ProcessarImagem); a foto antiga, se houver, é
// substituída.
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DonoDaFoto,
  filtroDaFoto,
  garantirQueODonoExiste,
} from './compartilhado';
import { ProcessarImagem } from './processar-imagem';

@Injectable()
export class SalvarFoto {
  constructor(
    private readonly prisma: PrismaService,
    private readonly processarImagem: ProcessarImagem,
  ) {}

  async executar(dono: DonoDaFoto, id: number, arquivo?: Buffer) {
    await garantirQueODonoExiste(this.prisma, dono, id);
    if (!arquivo || arquivo.length === 0) {
      throw new BadRequestException('Envie a foto no campo "foto".');
    }

    const { conteudo, tipoMime } = await this.processarImagem.executar(arquivo);
    const agora = new Date();
    const filtro = filtroDaFoto(dono, id);

    await this.prisma.$transaction([
      this.prisma.foto.deleteMany({ where: filtro }),
      this.prisma.foto.create({
        data: { ...filtro, conteudo, tipoMime, atualizadaEm: agora },
      }),
      dono === 'profissional'
        ? this.prisma.profissional.update({
            where: { id },
            data: { fotoAtualizadaEm: agora },
          })
        : this.prisma.produto.update({
            where: { id },
            data: { fotoAtualizadaEm: agora },
          }),
    ]);

    return { id, fotoAtualizadaEm: agora };
  }
}
