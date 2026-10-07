import { IsEmail } from 'class-validator';

// US Recuperação de Senha de Administrador (item 2.2): o administrador
// informa o e-mail cadastrado (que é o próprio login).
export class SolicitarRecuperacaoSenhaDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  login: string;
}
