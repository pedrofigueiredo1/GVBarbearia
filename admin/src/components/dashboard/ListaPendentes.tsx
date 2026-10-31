'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { editarAgendamento } from '@/lib/agendamentos';
import { formatarDataHora } from '@/lib/formatar';
import type { AgendamentoResumo } from '@/types/dashboard';

interface Props {
  pendentes: AgendamentoResumo[];
  total: number;
  // Chamado depois de confirmar um agendamento, para o painel buscar os números de novo.
  aoConfirmar: () => void;
}

// Agendamentos feitos pelos clientes no app que ainda aguardam confirmação da
// barbearia, com o botão de confirmar direto na lista.
export function ListaPendentes({ pendentes, total, aoConfirmar }: Props) {
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar(id: number) {
    setErro(null);
    setConfirmandoId(id);
    try {
      await editarAgendamento(id, { status: 'CONFIRMADO' });
      aoConfirmar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível confirmar o agendamento.');
    } finally {
      setConfirmandoId(null);
    }
  }

  if (pendentes.length === 0) {
    return <p className="text-sm text-white/50">Nenhum agendamento aguardando confirmação.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {erro && <p className="rounded-lg border border-red-200 p-2 text-sm text-red-600">{erro}</p>}
      <ul className="flex flex-col divide-y divide-borda">
        {pendentes.map((agendamento) => (
          <li key={agendamento.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{agendamento.cliente.nome}</p>
              <p className="truncate text-xs text-white/60">
                {agendamento.servico.nome} com {agendamento.profissional.nome}
              </p>
              <p className="text-xs text-white/50">{formatarDataHora(agendamento.dataHora)}</p>
            </div>
            <button
              onClick={() => confirmar(agendamento.id)}
              disabled={confirmandoId === agendamento.id}
              className="shrink-0 rounded-lg bg-copper px-3 py-1.5 text-xs font-medium text-copper-ink hover:brightness-110 disabled:opacity-50"
            >
              {confirmandoId === agendamento.id ? 'Confirmando...' : 'Confirmar'}
            </button>
          </li>
        ))}
      </ul>
      {total > pendentes.length && (
        <Link href="/agendamentos" className="text-sm text-copper hover:underline">
          Ver todos os {total} pendentes
        </Link>
      )}
    </div>
  );
}
