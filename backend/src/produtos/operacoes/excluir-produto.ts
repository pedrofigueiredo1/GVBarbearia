// ===== EXCLUIR PRODUTO =====
// Ctrl+F "EXCLUIR PRODUTO" para achar este bloco.
// US "Exclusão de Produto" (item 2.20 da documentação).
// Diferente de Profissional/Serviço, essa US não prevê bloqueio por
// vínculo (produto não se associa a agendamentos futuros) — só exige
// confirmação, já tratada na tela do painel.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarProduto } from './buscar-produto';

@Injectable()
export class ExcluirProduto {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarProduto: BuscarProduto,
  ) {}

  async executar(id: number) {
    await this.buscarProduto.executar(id);

    return this.prisma.produto.delete({ where: { id } });
  }
}
