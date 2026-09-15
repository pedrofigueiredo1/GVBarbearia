'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarProfissional,
  editarProfissional,
  excluirProfissional,
  listarProfissionais,
} from '@/lib/profissionais';
import type { Profissional, ProfissionalInput } from '@/types/profissional';
import { ProfissionalFormModal } from '@/components/ProfissionalFormModal';

type EstadoModal =
  | { aberto: false }
  | { aberto: true; profissional: Profissional | null };

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setProfissionais(await listarProfissionais());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os profissionais. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: ProfissionalInput) {
    if (modal.aberto && modal.profissional) {
      await editarProfissional(modal.profissional.id, data);
    } else {
      await criarProfissional(data);
    }
    setModal({ aberto: false });
    await carregar();
  }

  async function handleExcluir(profissional: Profissional) {
    const confirmado = window.confirm(
      `Excluir o profissional "${profissional.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirProfissional(profissional.id);
      await carregar();
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível excluir o profissional.',
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Profissionais</h2>
        <button
          onClick={() => setModal({ aberto: true, profissional: null })}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          + Novo profissional
        </button>
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && profissionais.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Nenhum profissional cadastrado.
        </p>
      )}

      {!carregando && !erro && profissionais.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">Especialidade</th>
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.map((profissional) => (
              <tr
                key={profissional.id}
                className="border-b border-black/5 dark:border-white/10"
              >
                <td className="py-2 pr-4">{profissional.nome}</td>
                <td className="py-2 pr-4">{profissional.especialidade}</td>
                <td className="py-2 pr-4 max-w-xs truncate" title={profissional.descricao}>
                  {profissional.descricao}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setModal({ aberto: true, profissional })}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(profissional)}
                    className="text-sm underline text-red-600"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal.aberto && (
        <ProfissionalFormModal
          profissional={modal.profissional}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
