import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Reflete a regra "os campos obrigatórios devem permanecer válidos após a
// edição" da US Edição de Informações da Barbearia. Como não existe um
// "cadastro" separado (é sempre a mesma tela editando o registro único),
// um único DTO serve tanto para criar quanto para atualizar.
export class BarbeariaDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da barbearia é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O endereço é obrigatório.' })
  @MaxLength(200)
  endereco: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @MaxLength(20)
  telefone: string;

  @IsString()
  @IsNotEmpty({ message: 'O horário de funcionamento é obrigatório.' })
  @MaxLength(200)
  horarioFuncionamento: string;
}
