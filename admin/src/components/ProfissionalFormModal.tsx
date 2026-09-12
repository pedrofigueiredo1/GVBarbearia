'use client';

import { FormEvent, useState } from 'react';
import type { Profissional, ProfissionalInput } from '@/types/profissional';

interface Props {
  profissional?: Profissional | null;
  onClose: () => void;
  onSalvar: (data: ProfissionalInput) => Promise<void>;
}

const campoVazio: ProfissionalInput = {
  nome: '',
  especialidade: '',
  descricao: '',
};

// Um único modal serve tanto para cadastro quanto para edição: quando
// `profissional` é informado, os campos vêm preenchidos (US Edição);
// quando não, o formulário começa vazio (US Cadastro).
export function ProfissionalFormModal({ profissional, onClose, onSalvar }: Props) {
  const [form, setForm] = useState<ProfissionalInput>(
    profissional
      ? {
          nome: profissional.nome,
          especialidade: profissional.especialidade,
          descricao: profissional.descricao,
        }
      : campoVazio,
  );
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await onSalvar(form);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar profissional.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md p-6 border border-black/10 dark:border-white/15">
        <h3 className="text-lg font-semibold mb-4">
          {profissional ? 'Editar profissional' : 'Novo profissional'}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              required
              maxLength={100}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="especialidade">
              Especialidade
            </label>
            <input
              id="especialidade"
              required
              maxLength={100}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.especialidade}
              onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="descricao">
              Descrição
            </label>
            <textarea
              id="descricao"
              required
              maxLength={500}
              rows={4}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm resize-none"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
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
