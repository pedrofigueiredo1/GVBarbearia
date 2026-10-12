// ===== LISTAR AVALIACOES PUBLICAS =====
// Ctrl+F "LISTAR AVALIACOES PUBLICAS" para achar este bloco.
// US "Consulta de Avaliações" do cliente (item 2.45 da documentação). Versão
// própria da listagem do painel: como a rota é aberta, só sai o necessário
// (nota, comentário, primeiro nome do autor, serviço e profissional), sem
// ids de cliente/agendamento e sem o sobrenome de quem avaliou.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const QUANTIDADE_MAXIMA = 50;

@Injectable()
export class ListarAvaliacoesPublicas {
  constructor(private readonly prisma: PrismaService) {}

  async executar() {
    const avaliacoes = await this.prisma.avaliacao.findMany({
      orderBy: { criadoEm: 'desc' },
      take: QUANTIDADE_MAXIMA,
      select: {
        id: true,
        nota: true,
        comentario: true,
        criadoEm: true,
        agendamento: {
          select: {
            cliente: { select: { nome: true } },
            servico: { select: { nome: true } },
            profissional: { select: { nome: true } },
          },
        },
      },
    });

    return avaliacoes.map((avaliacao) => ({
      id: avaliacao.id,
      nota: avaliacao.nota,
      comentario: avaliacao.comentario,
      criadoEm: avaliacao.criadoEm,
      autor: avaliacao.agendamento.cliente.nome.trim().split(/\s+/)[0],
      servico: avaliacao.agendamento.servico.nome,
      profissional: avaliacao.agendamento.profissional.nome,
    }));
  }
}
