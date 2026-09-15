'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarServico,
  editarServico,
  excluirServico,
  listarServicos,
} from '@/lib/servicos';
import type { Servico, ServicoInput } from '@/types/servico';
import { ServicoFormModal } from '@/components/ServicoFormModal';

type EstadoModal = { aberto: false } | { aberto: true; servico: Servico | null };

const formatarValor = (valor: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setServicos(await listarServicos());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os serviços. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: ServicoInput) {
    if (modal.aberto && modal.servico) {
      await editarServico(modal.servico.id, data);
    } else {
      await criarServico(data);
    }
    setModal({ aberto: false });
    await carregar();
  }

  async function handleExcluir(servico: Servico) {
    const confirmado = window.confirm(
      `Excluir o serviço "${servico.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirServico(servico.id);
      await carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Não foi possível excluir o serviço.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Serviços</h2>
        <button
          onClick={() => setModal({ aberto: true, servico: null })}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          + Novo serviço
        </button>
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && servicos.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">Nenhum serviço cadastrado.</p>
      )}

      {!carregando && !erro && servicos.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 font-medium">Valor</th>
              <th className="py-2 pr-4 font-medium">Duração</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((servico) => (
              <tr key={servico.id} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{servico.nome}</td>
                <td className="py-2 pr-4 max-w-xs truncate" title={servico.descricao}>
                  {servico.descricao}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">{formatarValor(servico.valor)}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{servico.duracaoMinutos} min</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setModal({ aberto: true, servico })}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(servico)}
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
        <ServicoFormModal
          servico={modal.servico}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
