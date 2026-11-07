// ===== CONSULTAR FOTO =====
// Ctrl+F "CONSULTAR FOTO" para achar este bloco.
// Devolve a imagem de um profissional ou produto para o app e o painel. A rota
// é aberta (as fotos aparecem para o cliente sem login).
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DonoDaFoto, filtroDaFoto } from './compartilhado';

@Injectable()
export class ConsultarFoto {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dono: DonoDaFoto, id: number) {
    const foto = await this.prisma.foto.findFirst({
      where: filtroDaFoto(dono, id),
      select: { conteudo: true, tipoMime: true },
    });
    if (!foto) throw new NotFoundException('Foto não encontrada.');
    return foto;
  }
}
