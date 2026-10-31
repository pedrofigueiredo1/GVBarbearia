'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  cancelarAgendamento,
  criarAgendamento,
  editarAgendamento,
} from '@/lib/agendamentos';
import { formatarDataHora } from '@/lib/formatar';
import type {
  Agendamento,
  CreateAgendamentoInput,
  StatusAgendamento,
  UpdateAgendamentoInput,
} from '@/types/agendamento';
import { AgendamentoFormModal } from '@/components/AgendamentoFormModal';
import { CalendarioAgendamentos } from '@/components/agendamentos/CalendarioAgendamentos';
import { DetalhesAgendamentoModal } from '@/components/agendamentos/DetalhesAgendamentoModal';
import { ListaAgendamentos } from '@/components/agendamentos/ListaAgendamentos';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { Botao } from '@/components/ui/Botao';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';

type EstadoModal =
  | { aberto: false }
  | {
      aberto: true;
      agendamento: Agendamento | null;
      inicial?: { profissionalId?: number; dataHora?: string };
    };

// "Cancelar" aqui não apaga o registro — muda o status para CANCELADO e
// libera o horário do profissional (ver comentário em
// agendamentos.service.ts no backend). Por isso o botão de ação chama
// "Cancelar", não "Excluir". A tela tem duas visões dos mesmos agendamentos: o
// calendário (dia por barbeiro e semana) e a lista com filtros.
export default function AgendamentosPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [aba, setAba] = useState<'calendario' | 'lista'>('calendario');
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });
  const [detalhes, setDetalhes] = useState<Agendamento | null>(null);
  // Sobe a cada mudança para o calendário e a lista buscarem de novo.
  const [versao, setVersao] = useState(0);
  const recarregar = () => setVersao((v) => v + 1);

  async function handleSalvar(data: CreateAgendamentoInput | UpdateAgendamentoInput) {
    const editando = modal.aberto && modal.agendamento;
    if (editando) {
      await editarAgendamento(modal.agendamento!.id, data);
    } else {
      await criarAgendamento(data as CreateAgendamentoInput);
    }
    setModal({ aberto: false });
    avisos.sucesso(editando ? 'Agendamento atualizado.' : 'Agendamento cadastrado.');
    recarregar();
  }

  async function mudarStatus(agendamento: Agendamento, status: StatusAgendamento, mensagem: string) {
    try {
      await editarAgendamento(agendamento.id, { status });
      avisos.sucesso(mensagem);
      setDetalhes(null);
      recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível atualizar o agendamento.');
    }
  }

  async function handleCancelar(agendamento: Agendamento) {
    const ok = await confirmar({
      titulo: 'Cancelar agendamento',
      mensagem: `Cancelar o agendamento de "${agendamento.cliente.nome}" em ${formatarDataHora(agendamento.dataHora)}? O horário será liberado.`,
      textoConfirmar: 'Cancelar agendamento',
    });
    if (!ok) return;

    try {
      await cancelarAgendamento(agendamento.id);
      avisos.sucesso('Agendamento cancelado.');
      setDetalhes(null);
      recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível cancelar o agendamento.');
    }
  }

  const confirmarAgendamento = (a: Agendamento) => mudarStatus(a, 'CONFIRMADO', 'Agendamento confirmado.');
  const concluirAgendamento = (a: Agendamento) => mudarStatus(a, 'CONCLUIDO', 'Atendimento concluído.');
  const editar = (a: Agendamento) => {
    setDetalhes(null);
    setModal({ aberto: true, agendamento: a });
  };

  return (
    <div>
      <CabecalhoPagina titulo="Agendamentos" subtitulo="Agenda de cada barbeiro e lista completa.">
        <Botao icone="mais" onClick={() => setModal({ aberto: true, agendamento: null })}>
          Novo agendamento
        </Botao>
      </CabecalhoPagina>

      <div className="mb-5 inline-flex rounded-lg border border-borda bg-superficie p-0.5 text-sm">
        {(
          [
            ['calendario', 'Calendário'],
            ['lista', 'Lista'],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            aria-pressed={aba === valor}
            className={`rounded-md px-4 py-1.5 ${
              aba === valor ? 'bg-copper font-medium text-copper-ink' : 'text-white/70 hover:text-foreground'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'calendario' ? (
        <CalendarioAgendamentos
          versao={versao}
          aoNovo={(inicial) => setModal({ aberto: true, agendamento: null, inicial })}
          aoAbrir={setDetalhes}
        />
      ) : (
        <ListaAgendamentos
          versao={versao}
          aoEditar={editar}
          aoConfirmar={confirmarAgendamento}
          aoConcluir={concluirAgendamento}
          aoCancelar={handleCancelar}
        />
      )}

      {detalhes && (
        <DetalhesAgendamentoModal
          agendamento={detalhes}
          onClose={() => setDetalhes(null)}
          onEditar={() => editar(detalhes)}
          onConfirmar={() => confirmarAgendamento(detalhes)}
          onConcluir={() => concluirAgendamento(detalhes)}
          onCancelar={() => handleCancelar(detalhes)}
        />
      )}

      {modal.aberto && (
        <AgendamentoFormModal
          agendamento={modal.agendamento}
          inicial={modal.inicial}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
