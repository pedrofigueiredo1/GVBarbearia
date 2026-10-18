import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const aparar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// US Visualização e Edição de Perfil do Cliente (item 2.55): nome, e-mail,
// telefone e senha. Todos os campos são opcionais (o cliente envia só o que
// quer mudar), mas, quando enviados, não podem ficar vazios. Trocar o e-mail
// ou a senha exige `senhaAtual`, conferida na operação.
export class UpdatePerfilClienteDto {
  @IsOptional()
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ficar vazio.' })
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @Transform(aparar)
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @IsOptional()
  @Transform(aparar)
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode ficar vazio.' })
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  senhaAtual?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres.' })
  @MaxLength(72, { message: 'A nova senha deve ter no máximo 72 caracteres.' })
  novaSenha?: string;
}
