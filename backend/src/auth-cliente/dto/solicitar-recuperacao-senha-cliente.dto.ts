import { IsEmail } from 'class-validator';
import { EmailNormalizado } from '../../comum/decorators/transformacoes';

// US Recuperação de Senha de Cliente (item 2.39): o cliente informa o e-mail cadastrado.
export class SolicitarRecuperacaoSenhaClienteDto {
  @EmailNormalizado()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;
}
