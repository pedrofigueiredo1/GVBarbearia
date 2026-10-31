'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarCliente,
  editarCliente,
  excluirCliente,
  listarClientesPaginado,
} from '@/lib/clientes';
import type { Cliente, ClienteInput } from '@/types/cliente';
import type { Coluna } from '@/types/tabela';
import { useTabelaServidor } from '@/hooks/useTabelaServidor';
import { ClienteFormModal } from '@/components/ClienteFormModal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { Botao } from '@/components/ui/Botao';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';
import { BarraDeFiltros } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

type EstadoModal = { aberto: false } | { aberto: true; cliente: Cliente | null };

const COLUNAS: Coluna<Cliente>[] = [
  {
    chave: 'nome',
    titulo: 'Nome',
    ordenavel: true,
    render: (c) => <span className="font-medium">{c.nome}</span>,
  },
  { chave: 'email', titulo: 'E-mail', ordenavel: true, render: (c) => c.email },
  { chave: 'telefone', titulo: 'Telefone', ordenavel: true, className: 'whitespace-nowrap', render: (c) => c.telefone },
  {
    chave: 'criadoEm',
    titulo: 'Cliente desde',
    ordenavel: true,
    className: 'whitespace-nowrap',
    render: (c) => new Date(c.criadoEm).toLocaleDateString('pt-BR'),
  },
];

// O cadastro de cliente pelo admin não está nas US originais — é um caso de
// uso real confirmado com Pedro: atender presencialmente quem prefere não
// usar o app (ver comentário em clientes.controller.ts no backend). A lista é
// paginada no servidor porque cresce a cada novo cliente.
export default function ClientesPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  const tabela = useTabelaServidor<Cliente>(
    listarClientesPaginado,
    {},
    {
      ordenacaoInicial: { chave: 'nome', direcao: 'asc' },
      mensagemErro: 'Não foi possível carregar os clientes. Verifique se a API está no ar.',
    },
  );

  async function handleSalvar(data: ClienteInput) {
    const editando = modal.aberto && modal.cliente;
    if (editando) {
      await editarCliente(modal.cliente!.id, data);
    } else {
      await criarCliente(data as Required<ClienteInput>);
    }
    setModal({ aberto: false });
    avisos.sucesso(editando ? 'Cliente atualizado.' : 'Cliente cadastrado.');
    tabela.recarregar();
  }

  async function handleExcluir(cliente: Cliente) {
    const ok = await confirmar({
      titulo: 'Excluir cliente',
      mensagem: `Excluir "${cliente.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    });
    if (!ok) return;

    try {
      await excluirCliente(cliente.id);
      avisos.sucesso('Cliente excluído.');
      tabela.recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível excluir o cliente.');
    }
  }

  return (
    <div>
      <CabecalhoPagina titulo="Clientes" subtitulo="Clientes cadastrados no app e na recepção.">
        <Botao icone="mais" onClick={() => setModal({ aberto: true, cliente: null })}>
          Novo cliente
        </Botao>
      </CabecalhoPagina>

      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por nome, e-mail ou telefone"
        ativos={tabela.filtrando || tabela.busca !== ''}
        aoLimpar={tabela.limparBusca}
      />

      <TabelaDados
        colunas={COLUNAS}
        linhas={tabela.linhas}
        chaveLinha={(c) => c.id}
        carregando={tabela.carregando}
        erro={tabela.erro}
        aoTentarNovamente={tabela.recarregar}
        mensagemVazia="Nenhum cliente cadastrado."
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
        acoes={(c) => (
          <>
            <BotaoIcone
              icone="editar"
              titulo={`Editar ${c.nome}`}
              onClick={() => setModal({ aberto: true, cliente: c })}
            />
            <BotaoIcone
              icone="excluir"
              titulo={`Excluir ${c.nome}`}
              tom="vermelho"
              onClick={() => handleExcluir(c)}
            />
          </>
        )}
      />

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
