import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Reflete os "Critérios" da US Login de Administrador: usuário (aqui, o
// e-mail cadastrado como login) e senha.
export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  senha: string;
}
