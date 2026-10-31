'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarProduto,
  editarProduto,
  excluirProduto,
  listarProdutos,
} from '@/lib/produtos';
import { formatarMoeda } from '@/lib/formatar';
import type { Produto, ProdutoInput } from '@/types/produto';
import type { Coluna } from '@/types/tabela';
import { useCarregarLista } from '@/hooks/useCarregarLista';
import { useTabelaLocal } from '@/hooks/useTabelaLocal';
import { ProdutoFormModal } from '@/components/ProdutoFormModal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { Botao } from '@/components/ui/Botao';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';
import { BarraDeFiltros } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

type EstadoModal = { aberto: false } | { aberto: true; produto: Produto | null };

const COLUNAS: Coluna<Produto>[] = [
  {
    chave: 'nome',
    titulo: 'Nome',
    ordenavel: true,
    valor: (p) => p.nome,
    render: (p) => <span className="font-medium">{p.nome}</span>,
  },
  {
    chave: 'descricao',
    titulo: 'Descrição',
    className: 'max-w-sm',
    render: (p) => (
      <span className="block truncate text-white/70" title={p.descricao}>
        {p.descricao}
      </span>
    ),
  },
  {
    chave: 'preco',
    titulo: 'Preço',
    ordenavel: true,
    valor: (p) => Number(p.preco),
    className: 'whitespace-nowrap',
    render: (p) => <span className="text-copper">{formatarMoeda(p.preco)}</span>,
  },
];

const textoBusca = (p: Produto) => `${p.nome} ${p.descricao}`;

export default function ProdutosPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  const { dados, carregando, erro, recarregar } = useCarregarLista(
    listarProdutos,
    'Não foi possível carregar os produtos. Verifique se a API está no ar.',
  );
  const tabela = useTabelaLocal(dados, {
    colunas: COLUNAS,
    textoBusca,
    ordenacaoInicial: { chave: 'nome', direcao: 'asc' },
  });

  async function handleSalvar(data: ProdutoInput) {
    const editando = modal.aberto && modal.produto;
    if (editando) {
      await editarProduto(modal.produto!.id, data);
    } else {
      await criarProduto(data);
    }
    setModal({ aberto: false });
    avisos.sucesso(editando ? 'Produto atualizado.' : 'Produto cadastrado.');
    await recarregar();
  }

  async function handleExcluir(produto: Produto) {
    const ok = await confirmar({
      titulo: 'Excluir produto',
      mensagem: `Excluir "${produto.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    });
    if (!ok) return;

    try {
      await excluirProduto(produto.id);
      avisos.sucesso('Produto excluído.');
      await recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível excluir o produto.');
    }
  }

  return (
    <div>
      <CabecalhoPagina titulo="Produtos" subtitulo="Produtos vendidos na barbearia.">
        <Botao icone="mais" onClick={() => setModal({ aberto: true, produto: null })}>
          Novo produto
        </Botao>
      </CabecalhoPagina>

      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por nome ou descrição"
        ativos={tabela.filtrando}
        aoLimpar={() => tabela.setBusca('')}
      />

      <TabelaDados
        colunas={COLUNAS}
        linhas={tabela.linhas}
        chaveLinha={(p) => p.id}
        carregando={carregando}
        erro={erro}
        aoTentarNovamente={recarregar}
        mensagemVazia="Nenhum produto cadastrado."
        filtrando={tabela.filtrando}
        ordenacao={tabela.ordenacao}
        aoOrdenar={tabela.ordenar}
        paginacao={{
          pagina: tabela.pagina,
          total: tabela.total,
          tamanho: tabela.tamanho,
          aoMudarPagina: tabela.setPagina,
          aoMudarTamanho: tabela.setTamanho,
        }}
        acoes={(p) => (
          <>
            <BotaoIcone
              icone="editar"
              titulo={`Editar ${p.nome}`}
              onClick={() => setModal({ aberto: true, produto: p })}
            />
            <BotaoIcone
              icone="excluir"
              titulo={`Excluir ${p.nome}`}
              tom="vermelho"
              onClick={() => handleExcluir(p)}
            />
          </>
        )}
      />

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
