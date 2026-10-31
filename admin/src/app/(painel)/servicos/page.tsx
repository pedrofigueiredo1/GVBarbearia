'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  criarServico,
  editarServico,
  excluirServico,
  listarServicos,
} from '@/lib/servicos';
import { formatarMoeda } from '@/lib/formatar';
import type { Servico, ServicoInput } from '@/types/servico';
import type { Coluna } from '@/types/tabela';
import { useCarregarLista } from '@/hooks/useCarregarLista';
import { useTabelaLocal } from '@/hooks/useTabelaLocal';
import { ServicoFormModal } from '@/components/ServicoFormModal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { Botao } from '@/components/ui/Botao';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';
import { BarraDeFiltros } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

type EstadoModal = { aberto: false } | { aberto: true; servico: Servico | null };

const COLUNAS: Coluna<Servico>[] = [
  {
    chave: 'nome',
    titulo: 'Nome',
    ordenavel: true,
    valor: (s) => s.nome,
    render: (s) => <span className="font-medium">{s.nome}</span>,
  },
  {
    chave: 'descricao',
    titulo: 'Descrição',
    className: 'max-w-xs',
    render: (s) => (
      <span className="block truncate text-white/70" title={s.descricao}>
        {s.descricao}
      </span>
    ),
  },
  {
    chave: 'valor',
    titulo: 'Valor',
    ordenavel: true,
    valor: (s) => Number(s.valor),
    className: 'whitespace-nowrap',
    render: (s) => <span className="text-copper">{formatarMoeda(s.valor)}</span>,
  },
  {
    chave: 'duracao',
    titulo: 'Duração',
    ordenavel: true,
    valor: (s) => s.duracaoMinutos,
    className: 'whitespace-nowrap',
    render: (s) => `${s.duracaoMinutos} min`,
  },
];

const textoBusca = (s: Servico) => `${s.nome} ${s.descricao}`;

export default function ServicosPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [modal, setModal] = useState<EstadoModal>({ aberto: false });

  const { dados, carregando, erro, recarregar } = useCarregarLista(
    listarServicos,
    'Não foi possível carregar os serviços. Verifique se a API está no ar.',
  );
  const tabela = useTabelaLocal(dados, {
    colunas: COLUNAS,
    textoBusca,
    ordenacaoInicial: { chave: 'nome', direcao: 'asc' },
  });

  async function handleSalvar(data: ServicoInput) {
    const editando = modal.aberto && modal.servico;
    if (editando) {
      await editarServico(modal.servico!.id, data);
    } else {
      await criarServico(data as Required<ServicoInput>);
    }
    setModal({ aberto: false });
    avisos.sucesso(editando ? 'Serviço atualizado.' : 'Serviço cadastrado.');
    await recarregar();
  }

  async function handleExcluir(servico: Servico) {
    const ok = await confirmar({
      titulo: 'Excluir serviço',
      mensagem: `Excluir "${servico.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    });
    if (!ok) return;

    try {
      await excluirServico(servico.id);
      avisos.sucesso('Serviço excluído.');
      await recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível excluir o serviço.');
    }
  }

  return (
    <div>
      <CabecalhoPagina titulo="Serviços" subtitulo="Serviços oferecidos, com valor e duração.">
        <Botao icone="mais" onClick={() => setModal({ aberto: true, servico: null })}>
          Novo serviço
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
        chaveLinha={(s) => s.id}
        carregando={carregando}
        erro={erro}
        aoTentarNovamente={recarregar}
        mensagemVazia="Nenhum serviço cadastrado."
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
        acoes={(s) => (
          <>
            <BotaoIcone
              icone="editar"
              titulo={`Editar ${s.nome}`}
              onClick={() => setModal({ aberto: true, servico: s })}
            />
            <BotaoIcone
              icone="excluir"
              titulo={`Excluir ${s.nome}`}
              tom="vermelho"
              onClick={() => handleExcluir(s)}
            />
          </>
        )}
      />

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
