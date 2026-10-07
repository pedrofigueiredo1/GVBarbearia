// Itens usados pelas duas operações de recuperação de senha.
import { createHash } from 'crypto';

// US Recuperação de Senha de Administrador (item 2.2): o link vale 15 minutos.
export const VALIDADE_RECUPERACAO_MINUTOS = 15;

// O token enviado por e-mail nunca é salvo: o banco guarda só este hash, e a
// redefinição compara o hash do token recebido com o salvo.
export function hashDoToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
