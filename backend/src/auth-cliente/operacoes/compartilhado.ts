// Itens usados pelas duas operações de recuperação de senha do cliente.
import { createHash } from 'crypto';

// US Recuperação de Senha de Cliente (item 2.39): o código vale 15 minutos.
export const VALIDADE_CODIGO_MINUTOS = 15;

// Um código de 6 dígitos só tem 1 milhão de combinações, por isso o número de
// tentativas erradas é limitado: passado este limite, o código é invalidado e
// o cliente precisa pedir outro.
export const MAXIMO_TENTATIVAS_CODIGO = 5;

// O código enviado por e-mail nunca é salvo: o banco guarda só este hash,
// misturado ao id do cliente para que o mesmo código gere hashes diferentes.
export function hashDoCodigo(clienteId: number, codigo: string) {
  return createHash('sha256').update(`${clienteId}:${codigo}`).digest('hex');
}
