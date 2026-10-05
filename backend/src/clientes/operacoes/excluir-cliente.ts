// ===== EXCLUIR CLIENTE =====
// Ctrl+F "EXCLUIR CLIENTE" para achar este bloco.
// US "Exclusão de Cliente" (item 2.23 da documentação): impede a exclusão
// de cliente com agendamento pendente ou confirmado vinculado (aqui,
// diferente de Profissional/Serviço, a regra não menciona "futuros" — vale
// para qualquer agendamento pendente/confirmado, independente da data).
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BuscarCliente } from './buscar-cliente';
import { SELECT_SEM_SENHA } from './compartilhado';

@Injectable()
export class ExcluirCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buscarCliente: BuscarCliente,
  ) {}

  async executar(id: number) {
    await this.buscarCliente.executar(id);

    const agendamentoAtivo = await this.prisma.agendamento.findFirst({
      where: {
        clienteId: id,
        status: { in: [StatusAgendamento.PENDENTE, StatusAgendamento.CONFIRMADO] },
      },
    });

    if (agendamentoAtivo) {
      throw new ConflictException(
        'Não é possível excluir um cliente com agendamento pendente ou confirmado vinculado.',
      );
    }

    try {
      return await this.prisma.cliente.delete({
        where: { id },
        select: SELECT_SEM_SENHA,
      });
    } catch (error) {
      // Mesmo sem agendamento pendente/confirmado, pode existir histórico de
      // agendamentos concluídos/cancelados vinculados — o banco impede o
      // delete físico (chave estrangeira). Sem uma exclusão lógica (fora do
      // escopo atual), a mensagem abaixo ao menos evita um 500 genérico.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível excluir: existe histórico de agendamentos vinculado a este cliente.',
        );
      }
      throw error;
    }
  }
}
