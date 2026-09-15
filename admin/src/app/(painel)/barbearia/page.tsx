'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { consultarBarbearia, salvarBarbearia } from '@/lib/barbearia';
import type { Barbearia, BarbeariaInput } from '@/types/barbearia';

const campoVazio: BarbeariaInput = {
  nome: '',
  endereco: '',
  telefone: '',
  horarioFuncionamento: '',
};

// Diferente dos outros módulos, Barbearia não é uma lista (não há US de
// "Cadastro", só Consulta e Edição de um registro único do estabelecimento).
// Por isso a tela alterna entre modo visualização e modo edição na mesma
// página, em vez de usar um modal sobre uma tabela.
export default function BarbeariaPage() {
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<BarbeariaInput>(campoVazio);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setBarbearia(await consultarBarbearia());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar as informações. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function iniciarEdicao() {
    setForm(
      barbearia
        ? {
            nome: barbearia.nome,
            endereco: barbearia.endereco,
            telefone: barbearia.telefone,
            horarioFuncionamento: barbearia.horarioFuncionamento,
          }
        : campoVazio,
    );
    setErroForm(null);
    setEditando(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      const atualizado = await salvarBarbearia(form);
      setBarbearia(atualizado);
      setEditando(false);
    } catch (err) {
      setErroForm(
        err instanceof ApiError ? err.message : 'Erro ao salvar as informações.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Barbearia</h2>
        {!editando && (
          <button
            onClick={iniciarEdicao}
            className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
          >
            {barbearia ? 'Editar informações' : 'Cadastrar informações'}
          </button>
        )}
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && !editando && !barbearia && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Nenhuma informação cadastrada no momento.
        </p>
      )}

      {!carregando && !erro && !editando && barbearia && (
        <dl className="max-w-md flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-black/60 dark:text-white/60">Nome</dt>
            <dd>{barbearia.nome}</dd>
          </div>
          <div>
            <dt className="text-black/60 dark:text-white/60">Endereço</dt>
            <dd>{barbearia.endereco}</dd>
          </div>
          <div>
            <dt className="text-black/60 dark:text-white/60">Telefone</dt>
            <dd>{barbearia.telefone}</dd>
          </div>
          <div>
            <dt className="text-black/60 dark:text-white/60">Horário de funcionamento</dt>
            <dd>{barbearia.horarioFuncionamento}</dd>
          </div>
        </dl>
      )}

      {editando && (
        <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
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
            <label className="block text-sm font-medium mb-1" htmlFor="endereco">
              Endereço
            </label>
            <input
              id="endereco"
              required
              maxLength={200}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="telefone">
              Telefone
            </label>
            <input
              id="telefone"
              required
              maxLength={20}
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="horarioFuncionamento">
              Horário de funcionamento
            </label>
            <input
              id="horarioFuncionamento"
              required
              maxLength={200}
              placeholder="Ex: Seg a Sáb, 9h às 19h"
              className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              value={form.horarioFuncionamento}
              onChange={(e) => setForm({ ...form, horarioFuncionamento: e.target.value })}
            />
          </div>

          {erroForm && <p className="text-sm text-red-600">{erroForm}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setEditando(false)}
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
      )}
    </div>
  );
}
