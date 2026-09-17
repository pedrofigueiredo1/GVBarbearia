'use client';

import { FormEvent, useState } from 'react';
import type { Avaliacao, AvaliacaoInput } from '@/types/avaliacao';

interface Props {
  avaliacao: Avaliacao;
  onClose: () => void;
  onSalvar: (data: AvaliacaoInput) => Promise<void>;
}

// Só existe modo edição — não há Cadastro de Avaliação pelo painel (ver
// comentário em avaliacoes.controller.ts no backend).
export function AvaliacaoFormModal({ avaliacao, onClose, onSalvar }: Props) {
  const [form, setForm] = useState({
    nota: avaliacao.nota,
    comentario: avaliacao.comentario,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar(form);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar avaliação.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md p-6 border border-black/10 dark:border-white/15">
        <h3 className="text-lg font-semibold mb-4">Editar avaliação</h3>

        <p className="text-sm text-black/60 dark:text-white/60 mb-4">
          Autor: {avaliacao.agendamento.cliente.nome} — {avaliacao.agendamento.servico.nome} com{' '}
          {avaliacao.agendamento.profissional.nome}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nota">
              Nota
            </label>
            <select
              id="nota"
              required
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.nota}
              onChange={(e) => setForm({ ...form, nota: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="comentario">
              Comentário
            </label>
            <textarea
              id="comentario"
              required
              maxLength={1000}
              rows={4}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm resize-none"
              value={form.comentario}
              onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm border border-black/15 dark:border-white/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
