'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarProduto,
  editarProduto,
  excluirProduto,
  listarProdutos,
} from '@/lib/produtos';
import type { Produto, ProdutoInput } from '@/types/produto';
import { ProdutoFormModal } from '@/components/ProdutoFormModal';

type EstadoModal = { aberto: false } | { aberto: true; produto: Produto | null };

const formatarPreco = (preco: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(preco));

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setProdutos(await listarProdutos());
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os produtos. Verifique se a API está no ar.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(data: ProdutoInput) {
    if (modal.aberto && modal.produto) {
      await editarProduto(modal.produto.id, data);
    } else {
      await criarProduto(data);
    }
    setModal({ aberto: false });
    await carregar();
  }

  async function handleExcluir(produto: Produto) {
    const confirmado = window.confirm(
      `Excluir o produto "${produto.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    try {
      await excluirProduto(produto.id);
      await carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Não foi possível excluir o produto.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Produtos</h2>
        <button
          onClick={() => setModal({ aberto: true, produto: null })}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          + Novo produto
        </button>
      </div>

      {carregando && <p className="text-sm text-black/60 dark:text-white/60">Carregando...</p>}

      {!carregando && erro && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>
      )}

      {!carregando && !erro && produtos.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">Nenhum produto cadastrado.</p>
      )}

      {!carregando && !erro && produtos.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">Nome</th>
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 font-medium">Preço</th>
              <th className="py-2 pr-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{produto.nome}</td>
                <td className="py-2 pr-4 max-w-xs truncate" title={produto.descricao}>
                  {produto.descricao}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">{formatarPreco(produto.preco)}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <button
                    onClick={() => setModal({ aberto: true, produto })}
                    className="text-sm underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(produto)}
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
        <ProdutoFormModal
          produto={modal.produto}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
