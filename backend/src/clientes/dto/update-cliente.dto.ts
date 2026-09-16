import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Todos os campos são opcionais (o admin edita só o que precisa alterar),
// mas quando enviados não podem ser vazios — reflete "os campos
// obrigatórios do cadastro devem permanecer válidos após a edição". `senha`
// em branco/omitida mantém a senha atual (mesmo padrão de Administrador) —
// útil para o admin resetar a senha de um cliente presencialmente, já que a
// recuperação por e-mail ainda não existe.
export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ficar vazio.' })
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode ficar vazio.' })
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  senha?: string;
}
