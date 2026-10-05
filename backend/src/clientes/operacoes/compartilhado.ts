// Itens usados por mais de uma operação de Cliente — mantidos aqui para
// não duplicar a mesma regra em vários arquivos.
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// A senha (hash) nunca deve sair da API — todo retorno usa este `select`
// explícito em vez de devolver o registro inteiro do Prisma.
export const SELECT_SEM_SENHA = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.ClienteSelect;

export function tratarEmailDuplicado(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return new ConflictException('Este e-mail já está em uso por outro cliente.');
  }
  return error;
}
