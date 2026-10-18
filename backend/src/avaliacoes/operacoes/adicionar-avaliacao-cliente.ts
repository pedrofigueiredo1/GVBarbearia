// ===== CADASTRAR AVALIACAO PELO CLIENTE =====
// Ctrl+F "CADASTRAR AVALIACAO PELO CLIENTE" para achar este bloco.
// US "Cadastro de Avaliação" do cliente (item 2.54 da documentação): o cliente
// logado avalia um atendimento. Regras: o agendamento precisa ser dele, estar
// CONCLUIDO ("vínculo com um atendimento concluído") e ainda não ter avaliação
// (uma avaliação por atendimento). A nota de 1 a 5 e o comentário são
// validados no DTO.
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvaliacaoClienteDto } from '../dto/create-avaliacao-cliente.dto';

@Injectable()
export class AdicionarAvaliacaoCliente {
  constructor(private readonly prisma: PrismaService) {}

  async executar(clienteId: number, dto: CreateAvaliacaoClienteDto) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id: dto.agendamentoId },
      select: {
        clienteId: true,
        status: true,
        avaliacao: { select: { id: true } },
      },
    });

    if (!agendamento) {
      throw new NotFoundException(
        `Agendamento com id ${dto.agendamentoId} não foi encontrado.`,
      );
    }
    if (agendamento.clienteId !== clienteId) {
      throw new ForbiddenException(
        'Você só pode avaliar os seus próprios atendimentos.',
      );
    }
    if (agendamento.status !== StatusAgendamento.CONCLUIDO) {
      throw new ConflictException(
        'Só é possível avaliar atendimentos concluídos.',
      );
    }
    if (agendamento.avaliacao) {
      throw new ConflictException('Este atendimento já foi avaliado.');
    }

    try {
      return await this.prisma.avaliacao.create({
        data: {
          agendamentoId: dto.agendamentoId,
          nota: dto.nota,
          comentario: dto.comentario,
        },
        select: {
          id: true,
          agendamentoId: true,
          nota: true,
          comentario: true,
          criadoEm: true,
        },
      });
    } catch (error) {
      // Dois envios ao mesmo tempo: a chave única de agendamentoId garante que
      // só um vale, e o outro recebe a mesma resposta de "já avaliado".
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Este atendimento já foi avaliado.');
      }
      throw error;
    }
  }
}
