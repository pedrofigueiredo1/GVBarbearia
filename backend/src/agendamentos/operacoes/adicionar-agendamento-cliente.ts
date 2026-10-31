// ===== CADASTRAR AGENDAMENTO PELO CLIENTE =====
// Ctrl+F "CADASTRAR AGENDAMENTO PELO CLIENTE" para achar este bloco.
// US "Cadastro de Agendamento" do cliente (item 2.49 da documentação): o
// cliente logado reserva um horário. Diferente do cadastro feito pelo
// administrador (que já nasce CONFIRMADO), aqui o agendamento nasce PENDENTE,
// até a barbearia confirmar. O horário precisa estar livre para o profissional
// (mesma regra do painel) e, por ser uma reserva do cliente, precisa ser futuro
// e não pode coincidir com outro agendamento do próprio cliente. Também precisa
// ser um dos horários da grade da barbearia (dentro do expediente, com o
// serviço cabendo até o fim do período), estar dentro do prazo máximo de
// antecedência e não pode invadir o tempo de outro atendimento do profissional.
//
// A checagem e a gravação acontecem juntas, numa transação protegida por uma
// trava do banco (por profissional e por cliente): sem isso, vários pedidos ao
// mesmo tempo passariam todos pela checagem antes de qualquer um gravar.
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgendamentoClienteDto } from '../dto/create-agendamento-cliente.dto';
import { dataEHoraLocais, estaNaGrade } from '../horario-atendimento';
import {
  INCLUDE_RELACOES,
  MENSAGEM_HORARIO_OCUPADO,
  ValidarReferenciasAgendamento,
  traduzirConflitoDeHorario,
} from './compartilhado';
import {
  calcularHorariosLivres,
  garantirDentroDoHorizonte,
} from './consultar-horarios-disponiveis';

@Injectable()
export class AdicionarAgendamentoCliente {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validarReferencias: ValidarReferenciasAgendamento,
  ) {}

  async executar(clienteId: number, dto: CreateAgendamentoClienteDto) {
    const dataHora = new Date(dto.dataHora);

    if (dataHora <= new Date()) {
      throw new BadRequestException('Escolha uma data e um horário futuros.');
    }

    await this.validarReferencias.executar(
      clienteId,
      dto.servicoId,
      dto.profissionalId,
    );
    const servico = await this.prisma.servico.findUniqueOrThrow({
      where: { id: dto.servicoId },
    });
    if (!estaNaGrade(dataHora, servico.duracaoMinutos)) {
      throw new BadRequestException(
        'Esse horário está fora do horário de atendimento da barbearia.',
      );
    }
    const { data } = dataEHoraLocais(dataHora);
    garantirDentroDoHorizonte(data);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Trava por profissional e por cliente, sempre nesta ordem (evita
        // impasse entre duas transações). Quem chega depois espera a primeira
        // terminar e já enxerga o agendamento dela.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`profissional:${dto.profissionalId}`}))`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`cliente:${clienteId}`}))`;

        const conflitoDoProfissional = await tx.agendamento.findFirst({
          where: {
            profissionalId: dto.profissionalId,
            dataHora,
            status: { not: StatusAgendamento.CANCELADO },
          },
        });
        if (conflitoDoProfissional) {
          throw new ConflictException(MENSAGEM_HORARIO_OCUPADO);
        }

        const conflitoDoCliente = await tx.agendamento.findFirst({
          where: {
            clienteId,
            dataHora,
            status: { not: StatusAgendamento.CANCELADO },
          },
        });
        if (conflitoDoCliente) {
          throw new ConflictException(
            'Você já tem um agendamento nesse mesmo horário.',
          );
        }

        // Mesmo começando em horário diferente, o atendimento não pode invadir o
        // de outro (do profissional ou do cliente).
        const livres = await calcularHorariosLivres(tx, {
          clienteId,
          profissionalId: dto.profissionalId,
          duracaoMinutos: servico.duracaoMinutos,
          data,
        });
        if (!livres.some((h) => h.dataHora === dataHora.toISOString())) {
          throw new ConflictException(
            'Esse horário não está mais disponível. Escolha outro horário.',
          );
        }

        return tx.agendamento.create({
          data: {
            clienteId,
            servicoId: dto.servicoId,
            profissionalId: dto.profissionalId,
            dataHora,
            status: StatusAgendamento.PENDENTE,
          },
          include: INCLUDE_RELACOES,
        });
      });
    } catch (error) {
      throw traduzirConflitoDeHorario(error);
    }
  }
}
