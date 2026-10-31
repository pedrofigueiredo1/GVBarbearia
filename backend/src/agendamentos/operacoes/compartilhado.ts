// Itens usados por mais de uma operação de Agendamento — mantidos aqui
// para não duplicar a mesma regra em vários arquivos.
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosAgendamentoDto } from '../dto/filtros-agendamento.dto';

// US Consulta de Agendamento exige exibir cliente, serviço, profissional,
// data e horário — por isso toda leitura de agendamento inclui essas
// relações já resumidas aos campos relevantes.
export const INCLUDE_RELACOES = {
  cliente: { select: { id: true, nome: true, email: true, telefone: true } },
  servico: {
    select: { id: true, nome: true, valor: true, duracaoMinutos: true },
  },
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
      throw new NotFoundException(
        `Cliente com id ${clienteId} não foi encontrado.`,
      );
    }
    if (!servico) {
      throw new NotFoundException(
        `Serviço com id ${servicoId} não foi encontrado.`,
      );
    }
    if (!profissional) {
      throw new NotFoundException(
        `Profissional com id ${profissionalId} não foi encontrado.`,
      );
    }
  }
}

@Injectable()
export class ValidarHorarioDisponivel {
  constructor(private readonly prisma: PrismaService) {}

  // Regra de negócio: "não deve permitir dois agendamentos no mesmo
  // horário para o mesmo profissional". Um agendamento cancelado libera o
  // horário, por isso fica de fora dessa checagem.
  async executar(
    profissionalId: number,
    dataHora: Date | string,
    ignorarId?: number,
  ) {
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

// Filtros opcionais das listagens do painel (período, profissional, serviço,
// cliente e situação) transformados em condição do Prisma.
export function montarWhereAgendamentos(
  filtros: FiltrosAgendamentoDto,
): Prisma.AgendamentoWhereInput {
  const periodo: Prisma.DateTimeFilter = {};
  if (filtros.dataInicio) periodo.gte = new Date(filtros.dataInicio);
  if (filtros.dataFim) periodo.lte = new Date(filtros.dataFim);

  return {
    ...(Object.keys(periodo).length > 0 && { dataHora: periodo }),
    ...(filtros.profissionalId !== undefined && {
      profissionalId: filtros.profissionalId,
    }),
    ...(filtros.servicoId !== undefined && { servicoId: filtros.servicoId }),
    ...(filtros.clienteId !== undefined && { clienteId: filtros.clienteId }),
    ...(filtros.status !== undefined && { status: filtros.status }),
  };
}

// Um atendimento já concluído aconteceu de verdade (e pode ter avaliação e
// entrar no faturamento), então não pode mais ser cancelado.
export function garantirQueNaoEstaConcluido(status: StatusAgendamento) {
  if (status === StatusAgendamento.CONCLUIDO) {
    throw new ConflictException(
      'Um atendimento concluído não pode ser cancelado.',
    );
  }
}

export const MENSAGEM_HORARIO_OCUPADO =
  'Este profissional já tem um agendamento nesse mesmo horário.';

// O banco tem um índice único (profissional + horário, só agendamentos ativos)
// como trava final. Se duas pessoas chegarem juntas ao mesmo horário, a segunda
// leva esse erro do banco, que aqui vira a mesma resposta 409 da checagem comum.
export function traduzirConflitoDeHorario(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return new ConflictException(MENSAGEM_HORARIO_OCUPADO);
  }
  return error;
}
