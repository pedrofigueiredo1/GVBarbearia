import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmailNormalizado } from '../../comum/decorators/transformacoes';

export class RedefinirSenhaClienteDto {
  @EmailNormalizado()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'O código deve ter 6 dígitos.' })
  codigo: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  novaSenha: string;
}
