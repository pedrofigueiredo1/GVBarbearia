import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import {
  Aparar,
  EmailNormalizado,
} from '../../comum/decorators/transformacoes';

// Regra de negócio adicional (não presente nas US originais, alinhada com
// Pedro): o administrador também pode cadastrar clientes presencialmente —
// por exemplo, alguém que prefere ser atendido na barbearia em vez de usar
// o app. A senha definida aqui permite que a mesma conta seja usada depois
// para login no app, quando essa funcionalidade existir.
export class CreateClienteDto {
  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @EmailNormalizado()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  @MaxLength(20)
  @Matches(/^[0-9()+\-\s]{8,20}$/, {
    message:
      'Informe um telefone válido (apenas números, espaços, parênteses, + e -).',
  })
  telefone: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  senha: string;
}
