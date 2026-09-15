'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarAdministrador,
  editarAdministrador,
  excluirAdministrador,
  listarAdministradores,
} from '@/lib/administradores';
import type { Administrador, AdministradorInput } from '@/types/administrador';
import { AdministradorFormModal } from '@/components/AdministradorFormModal';

type EstadoModal =
  | { aberto: false }
  | { aberto: true; administrador: Administrador | null };

export default function AdministradoresPage() {
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setAdministradores(await listarAdministradores());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os administradores. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: AdministradorInput) {
    if (modal.aberto && modal.administrador) {
      await editarAdministrador(modal.administrador.id, data);
    } else {
      await criarAdministrador(data as Required<AdministradorInput>);
    }
    setModal({ aberto: false });
    await carregar();
  }

  async function handleExcluir(administrador: Administrador) {
    const confirmado = window.confirm(
      `Excluir o administrador "${administrador.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirAdministrador(administrador.id);
      await carregar();
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : 'Não foi possível excluir o administrador.',
      );
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Administradores</h2>
        <button
          onClick={() => setModal({ aberto: true, administrador: null })}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          + Novo administrador
        </button>
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && administradores.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Nenhum administrador cadastrado.
        </p>
      )}

      {!carregando && !erro && administradores.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">E-mail (login)</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {administradores.map((administrador) => (
              <tr key={administrador.id} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{administrador.nome}</td>
                <td className="py-2 pr-4">{administrador.login}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setModal({ aberto: true, administrador })}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(administrador)}
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
        <AdministradorFormModal
          administrador={modal.administrador}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
