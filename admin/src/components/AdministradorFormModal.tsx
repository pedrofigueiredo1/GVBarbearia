'use client';

import { FormEvent, useState } from 'react';
import type { Administrador, AdministradorInput } from '@/types/administrador';

interface Props {
  administrador?: Administrador | null;
  onClose: () => void;
  onSalvar: (data: AdministradorInput) => Promise<void>;
}

interface FormState {
  nome: string;
  login: string;
  senha: string;
}

const campoVazio: FormState = { nome: '', login: '', senha: '' };

// Na edição, a senha fica opcional: em branco significa "manter a atual"
// (o backend só troca o hash quando o campo é enviado). No cadastro, o
// campo é obrigatório via `required` no input.
export function AdministradorFormModal({ administrador, onClose, onSalvar }: Props) {
  const [form, setForm] = useState<FormState>(
    administrador
      ? { nome: administrador.nome, login: administrador.login, senha: '' }
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
        login: form.login,
        ...(form.senha ? { senha: form.senha } : {}),
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar administrador.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md p-6 border border-black/10 dark:border-white/15">
        <h3 className="text-lg font-semibold mb-4">
          {administrador ? 'Editar administrador' : 'Novo administrador'}
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
            <label className="block text-sm font-medium mb-1" htmlFor="login">
              E-mail (login)
            </label>
            <input
              id="login"
              type="email"
              required
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="senha">
              {administrador ? 'Nova senha (deixe em branco para manter a atual)' : 'Senha'}
            </label>
            <input
              id="senha"
              type="password"
              required={!administrador}
              minLength={6}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
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
