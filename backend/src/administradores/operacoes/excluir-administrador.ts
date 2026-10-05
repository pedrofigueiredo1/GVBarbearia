// ===== EXCLUIR ADMINISTRADOR =====
// Ctrl+F "EXCLUIR ADMINISTRADOR" para achar este bloco.
// US "Exclusão de Administrador" (item 2.6 da documentação). Não há regra
// de bloqueio por vínculo aqui — só exige confirmação, já tratada na tela.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarAdministrador } from './buscar-administrador';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class ExcluirAdministrador {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAdministrador: BuscarAdministrador,
  ) {}

  async executar(id: number) {
    await this.buscarAdministrador.executar(id);

    return this.prisma.administrador.delete({
      where: { id },
      select: SELECT_SEM_SENHA,
    });
  }
}
