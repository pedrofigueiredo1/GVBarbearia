// ===== EXCLUIR ADMINISTRADOR =====
// Ctrl+F "EXCLUIR ADMINISTRADOR" para achar este bloco.
// US "Exclusão de Administrador" (item 2.6 da documentação). Além da
// confirmação já tratada na tela, duas proteções para ninguém ficar sem acesso
// ao painel: o administrador não pode excluir a própria conta e o último
// administrador que restar não pode ser excluído.
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarAdministrador } from './buscar-administrador';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class ExcluirAdministrador {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAdministrador: BuscarAdministrador,
  ) {}

  async executar(id: number, solicitanteId: number) {
    await this.buscarAdministrador.executar(id);

    if (id === solicitanteId) {
      throw new ConflictException(
        'Você não pode excluir a sua própria conta. Peça a outro administrador.',
      );
    }

    if ((await this.prisma.administrador.count()) <= 1) {
      throw new ConflictException(
        'Não é possível excluir o último administrador.',
      );
    }

    return this.prisma.administrador.delete({
      where: { id },
      select: SELECT_SEM_SENHA,
    });
  }
}
