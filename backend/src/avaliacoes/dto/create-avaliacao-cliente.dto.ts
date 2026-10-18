import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// US Cadastro de Avaliação pelo cliente (item 2.54): nota e comentário,
// ligados a um atendimento. O cliente não é enviado no corpo (vem do token).
// Nota em branco ou fora de 1 a 5 é recusada (CT02). O comentário é aparado
// antes de validar, para que só espaços também contem como vazio.
export class CreateAvaliacaoClienteDto {
  @IsInt()
  @Min(1)
  agendamentoId: number;

  @IsInt({ message: 'A nota deve ser um número inteiro de 1 a 5.' })
  @Min(1, { message: 'A nota deve ser de 1 a 5.' })
  @Max(5, { message: 'A nota deve ser de 1 a 5.' })
  nota: number;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'O comentário é obrigatório.' })
  @MaxLength(1000)
  comentario: string;
}
