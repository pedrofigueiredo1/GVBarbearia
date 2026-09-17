import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// Não existe DTO de criação: o Cadastro de Avaliação é feito pelo próprio
// cliente no app (fase posterior), exigindo vínculo com um atendimento
// concluído. O painel administrativo só edita nota e comentário de
// avaliações já existentes — não faz sentido reatribuir a avaliação a
// outro agendamento, então `agendamentoId` não é editável aqui.
export class UpdateAvaliacaoDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'A nota deve ser de 1 a 5.' })
  @Max(5, { message: 'A nota deve ser de 1 a 5.' })
  nota?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O comentário não pode ficar vazio.' })
  @MaxLength(1000)
  comentario?: string;
}
