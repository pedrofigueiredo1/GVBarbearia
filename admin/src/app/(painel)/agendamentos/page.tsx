'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  cancelarAgendamento,
  criarAgendamento,
  editarAgendamento,
  listarAgendamentos,
} from '@/lib/agendamentos';
import type {
  Agendamento,
  CreateAgendamentoInput,
  UpdateAgendamentoInput,
} from '@/types/agendamento';
import { STATUS_LABEL } from '@/types/agendamento';
import { AgendamentoFormModal } from '@/components/AgendamentoFormModal';

type EstadoModal = { aberto: false } | { aberto: true; agendamento: Agendamento | null };

const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatarValor = (valor: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));

// "Cancelar" aqui não apaga o registro — muda o status para CANCELADO e
// libera o horário do profissional (ver comentário em
// agendamentos.service.ts no backend). Por isso o botão de ação chama
// "Cancelar", não "Excluir".
export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setAgendamentos(await listarAgendamentos());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os agendamentos. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: CreateAgendamentoInput | UpdateAgendamentoInput) {
    if (modal.aberto && modal.agendamento) {
      await editarAgendamento(modal.agendamento.id, data);
    } else {
      await criarAgendamento(data as CreateAgendamentoInput);
    }
    setModal({ aberto: false });
    await carregar();
  }

  async function handleCancelar(agendamento: Agendamento) {
    const confirmado = window.confirm(
      `Cancelar o agendamento de "${agendamento.cliente.nome}" em ${formatarDataHora(agendamento.dataHora)}?`,
    );
    if (!confirmado) return;

    try {
      await cancelarAgendamento(agendamento.id);
      await carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Não foi possível cancelar o agendamento.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Agendamentos</h2>
        <button
          onClick={() => setModal({ aberto: true, agendamento: null })}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          + Novo agendamento
        </button>
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && agendamentos.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">Nenhum agendamento cadastrado.</p>
      )}

      {!carregando && !erro && agendamentos.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Cliente</th>
              <th className="py-2 pr-4 font-medium">Serviço</th>
              <th className="py-2 pr-4 font-medium">Profissional</th>
              <th className="py-2 pr-4 font-medium">Data/Hora</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{agendamento.cliente.nome}</td>
                <td className="py-2 pr-4">
                  {agendamento.servico.nome} ({formatarValor(agendamento.servico.valor)})
                </td>
                <td className="py-2 pr-4">{agendamento.profissional.nome}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {formatarDataHora(agendamento.dataHora)}
                </td>
                <td className="py-2 pr-4">{STATUS_LABEL[agendamento.status]}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setModal({ aberto: true, agendamento })}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  {agendamento.status !== 'CANCELADO' && (
                    <button
                      onClick={() => handleCancelar(agendamento)}
                      className="text-sm underline text-red-600"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal.aberto && (
        <AgendamentoFormModal
          agendamento={modal.agendamento}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
