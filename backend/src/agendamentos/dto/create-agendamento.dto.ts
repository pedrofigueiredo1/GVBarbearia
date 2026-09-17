import { IsDateString, IsInt, Min } from 'class-validator';

// Reflete a US Cadastro de Agendamento (item 2.49): cliente, serviço,
// profissional, data e horário. Não recebe `status` — o cadastro pelo
// admin sempre nasce CONFIRMADO (decisão de negócio: diferente do fluxo do
// cliente pelo app, que nasceria PENDENTE, o admin já atendeu a pessoa e
// definiu o horário junto com ela).
export class CreateAgendamentoDto {
  @IsInt()
  @Min(1)
  clienteId: number;

  @IsInt()
  @Min(1)
  servicoId: number;

  @IsInt()
  @Min(1)
  profissionalId: number;

  @IsDateString({}, { message: 'Informe uma data e horário válidos (ISO 8601).' })
  dataHora: string;
}
