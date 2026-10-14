import { IsDateString, IsInt, Min } from 'class-validator';

// US Cadastro de Agendamento pelo cliente (item 2.49): serviço, profissional,
// data e horário. O cliente NÃO é enviado no corpo: vem sempre do token, e a
// whitelist do ValidationPipe rejeita qualquer tentativa de mandar um
// `clienteId` ou um `status`.
export class CreateAgendamentoClienteDto {
  @IsInt()
  @Min(1)
  servicoId: number;

  @IsInt()
  @Min(1)
  profissionalId: number;

  @IsDateString(
    {},
    { message: 'Informe uma data e horário válidos (ISO 8601).' },
  )
  dataHora: string;
}
