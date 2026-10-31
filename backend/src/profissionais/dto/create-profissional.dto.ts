import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Aparar } from '../../comum/decorators/transformacoes';

// Reflete os "Critérios" da US Cadastro de Profissional:
// nome, especialidade e descrição são obrigatórios.
export class CreateProfissionalDto {
  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O nome do profissional é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'A especialidade do profissional é obrigatória.' })
  @MaxLength(100)
  especialidade: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'A descrição do profissional é obrigatória.' })
  @MaxLength(500)
  descricao: string;
}
