'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarAdministrador,
  editarAdministrador,
  excluirAdministrador,
  listarAdministradores,
} from '@/lib/administradores';
import type { Administrador, AdministradorInput } from '@/types/administrador';
import type { Coluna } from '@/types/tabela';
import { useCarregarLista } from '@/hooks/useCarregarLista';
import { useTabelaLocal } from '@/hooks/useTabelaLocal';
import { AdministradorFormModal } from '@/components/AdministradorFormModal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { Botao } from '@/components/ui/Botao';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';
import { BarraDeFiltros } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

type EstadoModal =
  | { aberto: false }
  | { aberto: true; administrador: Administrador | null };

const COLUNAS: Coluna<Administrador>[] = [
  {
    chave: 'nome',
    titulo: 'Nome',
    ordenavel: true,
    valor: (a) => a.nome,
    render: (a) => <span className="font-medium">{a.nome}</span>,
  },
  {
    chave: 'login',
    titulo: 'E-mail (login)',
    ordenavel: true,
    valor: (a) => a.login,
    render: (a) => a.login,
  },
];

const textoBusca = (a: Administrador) => `${a.nome} ${a.login}`;

export default function AdministradoresPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  const { dados, carregando, erro, recarregar } = useCarregarLista(
    listarAdministradores,
    'Não foi possível carregar os administradores. Verifique se a API está no ar.',
  );
  const tabela = useTabelaLocal(dados, {
    colunas: COLUNAS,
    textoBusca,
    ordenacaoInicial: { chave: 'nome', direcao: 'asc' },
  });

  async function handleSalvar(data: AdministradorInput) {
    const editando = modal.aberto && modal.administrador;
    if (editando) {
      await editarAdministrador(modal.administrador!.id, data);
    } else {
      await criarAdministrador(data as Required<AdministradorInput>);
    }
    setModal({ aberto: false });
    avisos.sucesso(editando ? 'Administrador atualizado.' : 'Administrador cadastrado.');
    await recarregar();
  }

  async function handleExcluir(administrador: Administrador) {
    const ok = await confirmar({
      titulo: 'Excluir administrador',
      mensagem: `Excluir "${administrador.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    });
    if (!ok) return;

    try {
      await excluirAdministrador(administrador.id);
      avisos.sucesso('Administrador excluído.');
      await recarregar();
    } catch (err) {
      avisos.erro(
        err instanceof ApiError ? err.message : 'Não foi possível excluir o administrador.',
      );
    }
  }

  return (
    <div>
      <CabecalhoPagina
        titulo="Administradores"
        subtitulo="Quem pode entrar no painel administrativo."
      >
        <Botao icone="mais" onClick={() => setModal({ aberto: true, administrador: null })}>
          Novo administrador
        </Botao>
      </CabecalhoPagina>

      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por nome ou e-mail"
        ativos={tabela.filtrando}
        aoLimpar={() => tabela.setBusca('')}
      />

      <TabelaDados
        colunas={COLUNAS}
        linhas={tabela.linhas}
        chaveLinha={(a) => a.id}
        carregando={carregando}
        erro={erro}
        aoTentarNovamente={recarregar}
        mensagemVazia="Nenhum administrador cadastrado."
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
        acoes={(a) => (
          <>
            <BotaoIcone
              icone="editar"
              titulo={`Editar ${a.nome}`}
              onClick={() => setModal({ aberto: true, administrador: a })}
            />
            <BotaoIcone
              icone="excluir"
              titulo={`Excluir ${a.nome}`}
              tom="vermelho"
              onClick={() => handleExcluir(a)}
            />
          </>
        )}
      />

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
