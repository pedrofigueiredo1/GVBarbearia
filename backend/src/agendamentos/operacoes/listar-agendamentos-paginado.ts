// ===== LISTAR AGENDAMENTOS PAGINADO =====
// Ctrl+F "LISTAR AGENDAMENTOS PAGINADO" para achar este bloco.
// Versão da "Consulta de Agendamento" (item 2.25) usada pela tabela do painel:
// uma página por vez, com busca (cliente, serviço ou profissional), filtros e
// ordenação por data feitos no banco, porque a lista de agendamentos cresce a
// cada dia.
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Pagina, paginar } from '../../comum/dto/paginacao.dto';
import { ListarAgendamentosPaginadoDto } from '../dto/listar-agendamentos-paginado.dto';
import { INCLUDE_RELACOES, montarWhereAgendamentos } from './compartilhado';

@Injectable()
export class ListarAgendamentosPaginado {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dto: ListarAgendamentosPaginadoDto) {
    const { pagina, limite, skip, take } = paginar(dto);
    const busca = dto.busca?.trim();

    const where: Prisma.AgendamentoWhereInput = {
      ...montarWhereAgendamentos(dto),
      ...(busca && {
        OR: [
          { cliente: { nome: { contains: busca, mode: 'insensitive' } } },
          { servico: { nome: { contains: busca, mode: 'insensitive' } } },
          { profissional: { nome: { contains: busca, mode: 'insensitive' } } },
        ],
      }),
    };

    const [itens, total] = await Promise.all([
      this.prisma.agendamento.findMany({
        where,
        include: INCLUDE_RELACOES,
        orderBy: { dataHora: dto.direcao ?? 'desc' },
        skip,
        take,
      }),
      this.prisma.agendamento.count({ where }),
    ]);

    const resposta: Pagina<(typeof itens)[number]> = {
      itens,
      total,
      pagina,
      limite,
    };
    return resposta;
  }
}
