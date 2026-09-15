import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

// Reflete os "Critérios" da US Cadastro de Administrador:
// nome, login e senha são obrigatórios.
export class CreateAdministradorDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do administrador é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @IsEmail({}, { message: 'O login deve ser um e-mail válido.' })
  login: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  senha: string;
}
