// ===== CONSULTAR DATAS BLOQUEADAS =====
// Ctrl+F "CONSULTAR DATAS BLOQUEADAS" para achar este bloco.
// Dias em que o profissional não atende (folga, férias, feriado), de hoje até o
// limite de antecedência. O app usa a lista para apagar esses dias no calendário
// de agendamento. Só devolve as datas, nunca o motivo do bloqueio.
import { Injectable, NotFoundException } from '@nestjs/common';
import { datasBloqueadas } from '../../bloqueios-agenda/consultar-bloqueios';
import { PrismaService } from '../../prisma/prisma.service';
import { ConsultarDatasBloqueadasDto } from '../dto/consultar-datas-bloqueadas.dto';
import { hojeNaBarbearia, ultimaDataAgendavel } from '../horario-atendimento';

@Injectable()
export class ConsultarDatasBloqueadas {
  constructor(private readonly prisma: PrismaService) {}

  async executar(dto: ConsultarDatasBloqueadasDto) {
    const profissional = await this.prisma.profissional.findUnique({
      where: { id: dto.profissionalId },
    });
    if (!profissional) {
      throw new NotFoundException(
        `Profissional com id ${dto.profissionalId} não foi encontrado.`,
      );
    }

    const datas = await datasBloqueadas(
      this.prisma,
      dto.profissionalId,
      hojeNaBarbearia(),
      ultimaDataAgendavel(),
    );
    return { datas };
  }
}
