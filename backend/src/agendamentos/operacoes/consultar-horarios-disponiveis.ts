// ===== CONSULTAR HORÁRIOS DISPONÍVEIS =====
// Ctrl+F "CONSULTAR HORÁRIOS DISPONÍVEIS" para achar este bloco.
// US "Seleção de Data e Horário" do cliente (item 2.48): devolve só os horários
// em que o serviço escolhido cabe no expediente da barbearia e em que o
// profissional está livre. Também descarta os que já passaram e os que
// coincidem com outro agendamento do próprio cliente, porque o app não deve
// oferecer um horário que o backend recusaria.
//
// Um agendamento ocupa o intervalo [início, início + duração do serviço), e dois
// intervalos se chocam quando um começa antes de o outro terminar.
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsultarHorariosDisponiveisDto } from '../dto/consultar-horarios-disponiveis.dto';
import {
  HORIZONTE_DIAS,
  dataEHoraLocais,
  horariosDoDia,
  limitesDoDia,
  ultimaDataAgendavel,
} from '../horario-atendimento';

const MS_POR_MINUTO = 60_000;

// Aceita o PrismaService e também o cliente de uma transação, para a mesma
// conta servir na consulta e dentro da trava do agendamento.
type Banco = Pick<Prisma.TransactionClient, 'agendamento'>;

// Horários livres de um dia para um serviço e um profissional (já com a grade da
// barbearia, a antecedência e os atendimentos existentes descontados).
export async function calcularHorariosLivres(
  banco: Banco,
  params: {
    clienteId: number;
    profissionalId: number;
    duracaoMinutos: number;
    data: string;
  },
) {
  const { inicio, fim } = limitesDoDia(params.data);
  const ocupados = await banco.agendamento.findMany({
    where: {
      dataHora: { gte: inicio, lt: fim },
      status: { not: StatusAgendamento.CANCELADO },
      OR: [
        { profissionalId: params.profissionalId },
        { clienteId: params.clienteId },
      ],
    },
    select: { dataHora: true, servico: { select: { duracaoMinutos: true } } },
  });
  const intervalos = ocupados.map((a) => ({
    inicio: a.dataHora.getTime(),
    fim: a.dataHora.getTime() + a.servico.duracaoMinutos * MS_POR_MINUTO,
  }));

  const agora = Date.now();
  return horariosDoDia(params.data, params.duracaoMinutos)
    .filter((comeco) => {
      const inicioNovo = comeco.getTime();
      const fimNovo = inicioNovo + params.duracaoMinutos * MS_POR_MINUTO;
      if (inicioNovo <= agora) return false;
      return !intervalos.some((o) => inicioNovo < o.fim && o.inicio < fimNovo);
    })
    .map((comeco) => ({
      hora: dataEHoraLocais(comeco).hora,
      dataHora: comeco.toISOString(),
    }));
}

// Só se agenda até HORIZONTE_DIAS dias à frente.
export function garantirDentroDoHorizonte(data: string) {
  if (data > ultimaDataAgendavel()) {
    throw new BadRequestException(
      `Só é possível agendar com até ${HORIZONTE_DIAS} dias de antecedência.`,
    );
  }
}

@Injectable()
export class ConsultarHorariosDisponiveis {
  constructor(private readonly prisma: PrismaService) {}

  async executar(clienteId: number, dto: ConsultarHorariosDisponiveisDto) {
    const [ano, mes, dia] = dto.data.split('-').map(Number);
    const calendario = new Date(Date.UTC(ano, mes - 1, dia));
    if (
      calendario.getUTCMonth() !== mes - 1 ||
      calendario.getUTCDate() !== dia
    ) {
      throw new BadRequestException('Informe uma data válida.');
    }
    garantirDentroDoHorizonte(dto.data);

    const [servico, profissional] = await Promise.all([
      this.prisma.servico.findUnique({ where: { id: dto.servicoId } }),
      this.prisma.profissional.findUnique({
        where: { id: dto.profissionalId },
      }),
    ]);
    if (!servico) {
      throw new NotFoundException(
        `Serviço com id ${dto.servicoId} não foi encontrado.`,
      );
    }
    if (!profissional) {
      throw new NotFoundException(
        `Profissional com id ${dto.profissionalId} não foi encontrado.`,
      );
    }

    const horarios = await calcularHorariosLivres(this.prisma, {
      clienteId,
      profissionalId: dto.profissionalId,
      duracaoMinutos: servico.duracaoMinutos,
      data: dto.data,
    });

    return { data: dto.data, horarios };
  }
}
