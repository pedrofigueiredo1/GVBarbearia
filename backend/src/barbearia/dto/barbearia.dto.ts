import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';
import { Aparar } from '../../comum/decorators/transformacoes';

// Reflete a regra "os campos obrigatórios devem permanecer válidos após a
// edição" da US Edição de Informações da Barbearia. Como não existe um
// "cadastro" separado (é sempre a mesma tela editando o registro único),
// um único DTO serve tanto para criar quanto para atualizar.
export class BarbeariaDto {
  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O nome da barbearia é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O endereço é obrigatório.' })
  @MaxLength(200)
  endereco: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @MaxLength(20)
  @Matches(/^[0-9()+\-\s]{8,20}$/, {
    message:
      'Informe um telefone válido (apenas números, espaços, parênteses, + e -).',
  })
  telefone: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O horário de funcionamento é obrigatório.' })
  @MaxLength(200)
  horarioFuncionamento: string;
}
