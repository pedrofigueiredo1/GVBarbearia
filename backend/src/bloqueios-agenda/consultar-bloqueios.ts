// ===== BLOQUEIOS DE AGENDA =====
// Ctrl+F "BLOQUEIOS DE AGENDA" para achar este bloco.
// Consultas usadas por quem precisa saber se um dia está bloqueado: a lista de
// horários livres, o agendamento (do app e do painel) e o calendário do app.
// Recebem o cliente do banco (ou de uma transação) para servirem nos dois casos.
import { Prisma } from '@prisma/client';
import { somarDiasA } from '../agendamentos/horario-atendimento';

type Banco = Pick<Prisma.TransactionClient, 'bloqueioAgenda'>;

// Bloqueio que vale para o profissional no dia `data` (AAAA-MM-DD): o dele ou
// um geral (feriado, vale para todos). Sem bloqueio, devolve null.
export function bloqueioDoDia(
  banco: Banco,
  profissionalId: number,
  data: string,
) {
  return banco.bloqueioAgenda.findFirst({
    where: {
      dataInicio: { lte: data },
      dataFim: { gte: data },
      OR: [{ profissionalId: null }, { profissionalId }],
    },
    orderBy: { id: 'asc' },
  });
}

// Todos os dias bloqueados para o profissional entre `de` e `ate` (inclusive),
// um por um, para o calendário do app apagar esses dias.
export async function datasBloqueadas(
  banco: Banco,
  profissionalId: number,
  de: string,
  ate: string,
) {
  const bloqueios = await banco.bloqueioAgenda.findMany({
    where: {
      dataInicio: { lte: ate },
      dataFim: { gte: de },
      OR: [{ profissionalId: null }, { profissionalId }],
    },
  });

  const datas = new Set<string>();
  for (const b of bloqueios) {
    const primeira = b.dataInicio > de ? b.dataInicio : de;
    const ultima = b.dataFim < ate ? b.dataFim : ate;
    for (let d = primeira; d <= ultima; d = somarDiasA(d, 1)) datas.add(d);
  }
  return [...datas].sort();
}

export function mensagemDoBloqueio(motivo: string) {
  return `A agenda está bloqueada nessa data (${motivo}).`;
}
