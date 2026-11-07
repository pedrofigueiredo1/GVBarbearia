// ===== REMOVER FOTO =====
// Ctrl+F "REMOVER FOTO" para achar este bloco.
// Tira a foto de um profissional ou produto (o app volta a mostrar o espaço
// padrão sem foto). Remover de quem já não tem foto não dá erro.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DonoDaFoto,
  filtroDaFoto,
  garantirQueODonoExiste,
} from './compartilhado';

@Injectable()
export class RemoverFoto {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dono: DonoDaFoto, id: number) {
    await garantirQueODonoExiste(this.prisma, dono, id);

    await this.prisma.$transaction([
      this.prisma.foto.deleteMany({ where: filtroDaFoto(dono, id) }),
      dono === 'profissional'
        ? this.prisma.profissional.update({
            where: { id },
            data: { fotoAtualizadaEm: null },
          })
        : this.prisma.produto.update({
            where: { id },
            data: { fotoAtualizadaEm: null },
          }),
    ]);

    return { id, fotoAtualizadaEm: null };
  }
}
