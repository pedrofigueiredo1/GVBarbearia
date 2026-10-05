// ===== CANCELAR AGENDAMENTO =====
// Ctrl+F "CANCELAR AGENDAMENTO" para achar este bloco.
// "Exclusão de Agendamento" (item 2.27) na documentação é, na prática, um
// cancelamento: o critério e os testes falam em status "cancelado" e
// horário liberado, não em remover o registro do banco — por isso esta
// operação atualiza o status em vez de apagar, preservando o histórico
// para os relatórios (que precisam contar confirmados/cancelados/
// concluídos).
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarAgendamento } from './buscar-agendamento';
import { INCLUDE_RELACOES } from './compartilhado';

@Injectable()
export class CancelarAgendamento {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarAgendamento: BuscarAgendamento,
  ) {}

  async executar(id: number) {
    await this.buscarAgendamento.executar(id);

    return this.prisma.agendamento.update({
      where: { id },
      data: { status: StatusAgendamento.CANCELADO },
      include: INCLUDE_RELACOES,
    });
  }
}
