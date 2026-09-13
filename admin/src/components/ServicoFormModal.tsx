'use client';

import { FormEvent, useState } from 'react';
import type { Servico, ServicoInput } from '@/types/servico';

interface Props {
  servico?: Servico | null;
  onClose: () => void;
  onSalvar: (data: ServicoInput) => Promise<void>;
}

interface FormState {
  nome: string;
  descricao: string;
  valor: string;
  duracaoMinutos: string;
}

const campoVazio: FormState = {
  nome: '',
  descricao: '',
  valor: '',
  duracaoMinutos: '',
};

// Um único modal serve tanto para cadastro quanto para edição, seguindo o
// mesmo padrão usado em ProfissionalFormModal. valor/duracaoMinutos ficam
// como string no formulário (inputs controlados) e só viram number no
// momento de montar o payload enviado à API.
export function ServicoFormModal({ servico, onClose, onSalvar }: Props) {
  const [form, setForm] = useState<FormState>(
    servico
      ? {
          nome: servico.nome,
          descricao: servico.descricao,
          valor: servico.valor,
          duracaoMinutos: String(servico.duracaoMinutos),
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
      await onSalvar({
        nome: form.nome,
        descricao: form.descricao,
        valor: Number(form.valor.replace(',', '.')),
        duracaoMinutos: Number(form.duracaoMinutos),
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar serviço.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md p-6 border border-black/10 dark:border-white/15">
        <h3 className="text-lg font-semibold mb-4">
          {servico ? 'Editar serviço' : 'Novo serviço'}
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
            <label className="block text-sm font-medium mb-1" htmlFor="descricao">
              Descrição
            </label>
            <textarea
              id="descricao"
              required
              maxLength={500}
              rows={3}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm resize-none"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="valor">
                Valor (R$)
              </label>
              <input
                id="valor"
                required
                type="number"
                min="0.01"
                step="0.01"
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="duracaoMinutos">
                Duração (min)
              </label>
              <input
                id="duracaoMinutos"
                required
                type="number"
                min="1"
                step="1"
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={form.duracaoMinutos}
                onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
              />
            </div>
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
