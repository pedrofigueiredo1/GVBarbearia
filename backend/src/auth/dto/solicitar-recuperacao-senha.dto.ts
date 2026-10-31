import { IsEmail } from 'class-validator';
import { EmailNormalizado } from '../../comum/decorators/transformacoes';

// US Recuperação de Senha de Administrador (item 2.2): o administrador
// informa o e-mail cadastrado (que é o próprio login).
export class SolicitarRecuperacaoSenhaDto {
  @EmailNormalizado()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  login: string;
}
