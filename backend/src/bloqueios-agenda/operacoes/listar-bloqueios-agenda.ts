// ===== LISTAR BLOQUEIOS DE AGENDA =====
// Ctrl+F "LISTAR BLOQUEIOS DE AGENDA" para achar este bloco.
// Bloqueios em andamento ou futuros, do mais próximo para o mais distante.
// Os que já terminaram saem da lista: não mudam mais nada na agenda.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hojeNaBarbearia } from '../../agendamentos/horario-atendimento';

@Injectable()
export class ListarBloqueiosAgenda {
  constructor(private readonly prisma: PrismaService) {}

  executar() {
    return this.prisma.bloqueioAgenda.findMany({
      where: { dataFim: { gte: hojeNaBarbearia() } },
      include: { profissional: { select: { id: true, nome: true } } },
      orderBy: [{ dataInicio: 'asc' }, { id: 'asc' }],
    });
  }
}
