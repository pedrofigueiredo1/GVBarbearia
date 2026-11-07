import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ConsultarHorariosDisponiveisDto } from './consultar-horarios-disponiveis.dto';

// Consulta de horários livres feita pelo painel: os mesmos parâmetros do app,
// mais o cliente (para não oferecer um horário em que ele já tem outro
// atendimento) e o agendamento que está sendo remarcado (o horário dele conta
// como livre). Os dois são opcionais.
export class ConsultarHorariosPainelDto extends ConsultarHorariosDisponiveisDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  agendamentoId?: number;
}
