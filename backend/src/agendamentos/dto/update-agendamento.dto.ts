import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { StatusAgendamento } from '@prisma/client';

// Reflete a US Edição de Agendamento: "editar data, horário, serviço ou
// profissional". `status` também é editável aqui — não está nos Critérios
// originais, mas é necessário na prática (ver comentário no schema.prisma):
// sem isso, um agendamento nunca chegaria a CONCLUIDO.
export class UpdateAgendamentoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  clienteId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  servicoId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  profissionalId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Informe uma data e horário válidos (ISO 8601).' })
  dataHora?: string;

  @IsOptional()
  @IsEnum(StatusAgendamento, { message: 'Status inválido.' })
  status?: StatusAgendamento;
}
