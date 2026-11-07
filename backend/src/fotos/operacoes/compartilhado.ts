// Itens usados pelas operações de foto de profissional e de produto.
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type DonoDaFoto = 'profissional' | 'produto';

// Garante que o profissional/produto existe (404 se não) antes de mexer na foto.
export async function garantirQueODonoExiste(
  prisma: PrismaService,
  dono: DonoDaFoto,
  id: number,
) {
  const existe =
    dono === 'profissional'
      ? await prisma.profissional.findUnique({ where: { id }, select: { id: true } })
      : await prisma.produto.findUnique({ where: { id }, select: { id: true } });
  if (!existe) {
    throw new NotFoundException(
      dono === 'profissional'
        ? 'Profissional não encontrado.'
        : 'Produto não encontrado.',
    );
  }
}

// Critério que acha a foto do dono (cada dono tem no máximo uma).
export function filtroDaFoto(dono: DonoDaFoto, id: number) {
  return dono === 'profissional' ? { profissionalId: id } : { produtoId: id };
}
