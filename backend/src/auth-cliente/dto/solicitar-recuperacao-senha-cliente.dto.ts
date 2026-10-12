import { IsEmail } from 'class-validator';

// US Recuperação de Senha de Cliente (item 2.39): o cliente informa o e-mail cadastrado.
export class SolicitarRecuperacaoSenhaClienteDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;
}
