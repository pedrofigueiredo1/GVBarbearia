// ===== LISTAR CLIENTES PAGINADO =====
// Ctrl+F "LISTAR CLIENTES PAGINADO" para achar este bloco.
// Versão da "Consulta de Clientes" (item 2.21) usada pela tela do painel: devolve
// uma página por vez, com busca e ordenação feitas no banco, porque a lista de
// clientes só cresce. A listagem completa (ListarClientes) continua existindo
// para os campos de seleção de outras telas.
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Pagina, paginar } from '../../comum/dto/paginacao.dto';
import { ListarClientesPaginadoDto } from '../dto/listar-clientes-paginado.dto';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class ListarClientesPaginado {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dto: ListarClientesPaginadoDto) {
    const { pagina, limite, skip, take } = paginar(dto);
    const busca = dto.busca?.trim();

    const where: Prisma.ClienteWhereInput = busca
      ? {
          OR: [
            { nome: { contains: busca, mode: 'insensitive' } },
            { email: { contains: busca, mode: 'insensitive' } },
            { telefone: { contains: busca } },
          ],
        }
      : {};

    const [itens, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        select: SELECT_SEM_SENHA,
        orderBy: { [dto.ordenarPor ?? 'nome']: dto.direcao ?? 'asc' },
        skip,
        take,
      }),
      this.prisma.cliente.count({ where }),
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
