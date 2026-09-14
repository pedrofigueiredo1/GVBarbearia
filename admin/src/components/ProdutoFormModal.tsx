'use client';

import { FormEvent, useState } from 'react';
import type { Produto, ProdutoInput } from '@/types/produto';

interface Props {
  produto?: Produto | null;
  onClose: () => void;
  onSalvar: (data: ProdutoInput) => Promise<void>;
}

interface FormState {
  nome: string;
  descricao: string;
  preco: string;
}

const campoVazio: FormState = {
  nome: '',
  descricao: '',
  preco: '',
};

// Um único modal serve tanto para cadastro quanto para edição, seguindo o
// mesmo padrão usado em ProfissionalFormModal e ServicoFormModal.
export function ProdutoFormModal({ produto, onClose, onSalvar }: Props) {
  const [form, setForm] = useState<FormState>(
    produto
      ? { nome: produto.nome, descricao: produto.descricao, preco: produto.preco }
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
        preco: Number(form.preco.replace(',', '.')),
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md p-6 border border-black/10 dark:border-white/15">
        <h3 className="text-lg font-semibold mb-4">
          {produto ? 'Editar produto' : 'Novo produto'}
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

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="preco">
              Preço (R$)
            </label>
            <input
              id="preco"
              required
              type="number"
              min="0.01"
              step="0.01"
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
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
