'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarProfissional,
  editarProfissional,
  excluirProfissional,
  listarProfissionais,
} from '@/lib/profissionais';
import type { Profissional, ProfissionalInput } from '@/types/profissional';
import type { Coluna } from '@/types/tabela';
import { useCarregarLista } from '@/hooks/useCarregarLista';
import { useTabelaLocal } from '@/hooks/useTabelaLocal';
import { ProfissionalFormModal } from '@/components/ProfissionalFormModal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { Botao } from '@/components/ui/Botao';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';
import { BarraDeFiltros } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

type EstadoModal =
  | { aberto: false }
  | { aberto: true; profissional: Profissional | null };

const COLUNAS: Coluna<Profissional>[] = [
  {
    chave: 'nome',
    titulo: 'Nome',
    ordenavel: true,
    valor: (p) => p.nome,
    render: (p) => <span className="font-medium">{p.nome}</span>,
  },
  {
    chave: 'especialidade',
    titulo: 'Especialidade',
    ordenavel: true,
    valor: (p) => p.especialidade,
    render: (p) => p.especialidade,
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
];

const textoBusca = (p: Profissional) => `${p.nome} ${p.especialidade} ${p.descricao}`;

export default function ProfissionaisPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  const { dados, carregando, erro, recarregar } = useCarregarLista(
    listarProfissionais,
    'Não foi possível carregar os profissionais. Verifique se a API está no ar.',
  );
  const tabela = useTabelaLocal(dados, {
    colunas: COLUNAS,
    textoBusca,
    ordenacaoInicial: { chave: 'nome', direcao: 'asc' },
  });

  async function handleSalvar(data: ProfissionalInput) {
    const editando = modal.aberto && modal.profissional;
    if (editando) {
      await editarProfissional(modal.profissional!.id, data);
    } else {
      await criarProfissional(data);
    }
    setModal({ aberto: false });
    avisos.sucesso(editando ? 'Profissional atualizado.' : 'Profissional cadastrado.');
    await recarregar();
  }

  async function handleExcluir(profissional: Profissional) {
    const ok = await confirmar({
      titulo: 'Excluir profissional',
      mensagem: `Excluir "${profissional.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    });
    if (!ok) return;

    try {
      await excluirProfissional(profissional.id);
      avisos.sucesso('Profissional excluído.');
      await recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível excluir o profissional.');
    }
  }

  return (
    <div>
      <CabecalhoPagina titulo="Profissionais" subtitulo="Barbeiros que atendem na barbearia.">
        <Botao icone="mais" onClick={() => setModal({ aberto: true, profissional: null })}>
          Novo profissional
        </Botao>
      </CabecalhoPagina>

      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por nome ou especialidade"
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
        mensagemVazia="Nenhum profissional cadastrado."
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
              onClick={() => setModal({ aberto: true, profissional: p })}
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
        <ProfissionalFormModal
          profissional={modal.profissional}
          onClose={() => setModal({ aberto: false })}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
