// ===== LISTAR AGENDAMENTOS DO CLIENTE =====
// Ctrl+F "LISTAR AGENDAMENTOS DO CLIENTE" para achar este bloco.
// US "Consulta de Agendamento" do cliente (item 2.52 da documentação): o
// cliente só enxerga os próprios agendamentos ("não deve visualizar
// agendamentos de outros usuários"), por isso o filtro é sempre o cliente do
// token, nunca um parâmetro da requisição.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { INCLUDE_RELACOES } from './compartilhado';

@Injectable()
export class ListarAgendamentosCliente {
  constructor(private readonly prisma: PrismaService) {}

  executar(clienteId: number) {
    return this.prisma.agendamento.findMany({
      where: { clienteId },
      include: INCLUDE_RELACOES,
      orderBy: { dataHora: 'asc' },
    });
  }
}
