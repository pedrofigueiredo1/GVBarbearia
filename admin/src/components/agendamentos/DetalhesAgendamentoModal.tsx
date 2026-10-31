'use client';

import { useEffect } from 'react';
import { Botao } from '@/components/ui/Botao';
import { EtiquetaStatus } from '@/components/ui/EtiquetaStatus';
import { formatarDataHora, formatarMoeda } from '@/lib/formatar';
import type { Agendamento } from '@/types/agendamento';

interface Props {
  agendamento: Agendamento;
  onClose: () => void;
  onEditar: () => void;
  onConfirmar: () => void;
  onConcluir: () => void;
  onCancelar: () => void;
}

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-borda/60 py-2 text-sm last:border-b-0">
      <dt className="text-white/60">{rotulo}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

// Detalhes de um agendamento com as ações do dia a dia: confirmar (quando o
// cliente agendou pelo app), concluir o atendimento, cancelar e editar.
export function DetalhesAgendamentoModal({
  agendamento,
  onClose,
  onEditar,
  onConfirmar,
  onConcluir,
  onCancelar,
}: Props) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [onClose]);

  const { status } = agendamento;
  const aberto = status === 'PENDENTE' || status === 'CONFIRMADO';
  // Só se conclui um atendimento que já começou (o servidor também recusa).
  const jaComecou = new Date(agendamento.dataHora).getTime() <= Date.now();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do agendamento"
        className="w-full max-w-md rounded-xl border border-borda bg-superficie p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{agendamento.cliente.nome}</h3>
            <p className="text-sm text-white/60">{formatarDataHora(agendamento.dataHora)}</p>
          </div>
          <EtiquetaStatus status={status} />
        </div>

        <dl>
          <Linha rotulo="Serviço">
            {agendamento.servico.nome} ({agendamento.servico.duracaoMinutos} min)
          </Linha>
          <Linha rotulo="Valor">{formatarMoeda(agendamento.servico.valor)}</Linha>
          <Linha rotulo="Profissional">{agendamento.profissional.nome}</Linha>
          <Linha rotulo="Telefone">{agendamento.cliente.telefone}</Linha>
          <Linha rotulo="E-mail">{agendamento.cliente.email}</Linha>
        </dl>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {status === 'PENDENTE' && (
            <Botao icone="confirmar" onClick={onConfirmar}>
              Confirmar
            </Botao>
          )}
          {aberto && jaComecou && (
            <Botao variante={status === 'PENDENTE' ? 'secundario' : 'primario'} icone="concluir" onClick={onConcluir}>
              Concluir atendimento
            </Botao>
          )}
          {aberto && (
            <Botao variante="secundario" icone="editar" onClick={onEditar}>
              Editar
            </Botao>
          )}
          {aberto && (
            <Botao variante="perigo" icone="cancelar" onClick={onCancelar}>
              Cancelar
            </Botao>
          )}
          {!aberto && (
            <Botao variante="secundario" icone="editar" onClick={onEditar}>
              Editar
            </Botao>
          )}
          <Botao variante="fantasma" onClick={onClose}>
            Fechar
          </Botao>
        </div>
      </div>
    </div>
  );
}
