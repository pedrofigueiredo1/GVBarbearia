// Itens usados por mais de uma operação de Agendamento — mantidos aqui
// para não duplicar a mesma regra em vários arquivos.
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// US Consulta de Agendamento exige exibir cliente, serviço, profissional,
// data e horário — por isso toda leitura de agendamento inclui essas
// relações já resumidas aos campos relevantes.
export const INCLUDE_RELACOES = {
  cliente: { select: { id: true, nome: true, email: true, telefone: true } },
  servico: { select: { id: true, nome: true, valor: true, duracaoMinutos: true } },
  profissional: { select: { id: true, nome: true, especialidade: true } },
};

@Injectable()
export class ValidarReferenciasAgendamento {
  constructor(private readonly prisma: PrismaService) {}

  async executar(clienteId: number, servicoId: number, profissionalId: number) {
    const [cliente, servico, profissional] = await Promise.all([
      this.prisma.cliente.findUnique({ where: { id: clienteId } }),
      this.prisma.servico.findUnique({ where: { id: servicoId } }),
      this.prisma.profissional.findUnique({ where: { id: profissionalId } }),
    ]);

    if (!cliente) {
      throw new NotFoundException(`Cliente com id ${clienteId} não foi encontrado.`);
    }
    if (!servico) {
      throw new NotFoundException(`Serviço com id ${servicoId} não foi encontrado.`);
    }
    if (!profissional) {
      throw new NotFoundException(`Profissional com id ${profissionalId} não foi encontrado.`);
    }
  }
}

@Injectable()
export class ValidarHorarioDisponivel {
  constructor(private readonly prisma: PrismaService) {}

  // Regra de negócio: "não deve permitir dois agendamentos no mesmo
  // horário para o mesmo profissional". Um agendamento cancelado libera o
  // horário, por isso fica de fora dessa checagem.
  async executar(profissionalId: number, dataHora: Date | string, ignorarId?: number) {
    const conflito = await this.prisma.agendamento.findFirst({
      where: {
        profissionalId,
        dataHora: new Date(dataHora),
        status: { not: StatusAgendamento.CANCELADO },
        ...(ignorarId !== undefined && { id: { not: ignorarId } }),
      },
    });

    if (conflito) {
      throw new ConflictException(
        'Este profissional já tem um agendamento nesse mesmo horário.',
      );
    }
  }
}
