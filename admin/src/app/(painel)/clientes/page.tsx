'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarCliente,
  editarCliente,
  excluirCliente,
  listarClientes,
} from '@/lib/clientes';
import type { Cliente, ClienteInput } from '@/types/cliente';
import { ClienteFormModal } from '@/components/ClienteFormModal';

type EstadoModal = { aberto: false } | { aberto: true; cliente: Cliente | null };

// O cadastro de cliente pelo admin não está nas US originais — é um caso de
// uso real confirmado com Pedro: atender presencialmente quem prefere não
// usar o app (ver comentário em clientes.controller.ts no backend).
export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setClientes(await listarClientes());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os clientes. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: ClienteInput) {
    if (modal.aberto && modal.cliente) {
      await editarCliente(modal.cliente.id, data);
    } else {
      await criarCliente(data as Required<ClienteInput>);
    }
    setModal({ aberto: false });
    await carregar();
  }

  async function handleExcluir(cliente: Cliente) {
    const confirmado = window.confirm(
      `Excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirCliente(cliente.id);
      await carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Não foi possível excluir o cliente.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <button
          onClick={() => setModal({ aberto: true, cliente: null })}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          + Novo cliente
        </button>
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && clientes.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">Nenhum cliente cadastrado.</p>
      )}

      {!carregando && !erro && clientes.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">E-mail</th>
              <th className="py-2 pr-4 font-medium">Telefone</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{cliente.nome}</td>
                <td className="py-2 pr-4">{cliente.email}</td>
                <td className="py-2 pr-4">{cliente.telefone}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setModal({ aberto: true, cliente })}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(cliente)}
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
        <ClienteFormModal
          cliente={modal.cliente}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
