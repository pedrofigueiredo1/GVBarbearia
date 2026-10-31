import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { EmailNormalizado } from '../../comum/decorators/transformacoes';

// US Login de Cliente (item 2.38): o cliente entra com o e-mail cadastrado e a senha.
export class LoginClienteDto {
  @EmailNormalizado()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  senha: string;
}
