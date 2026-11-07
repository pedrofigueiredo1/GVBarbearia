'use client';

import { ApiError } from '@/lib/api';
import { excluirBloqueio, listarBloqueios } from '@/lib/bloqueios';
import { hojeLocal } from '@/lib/datas';
import type { BloqueioAgenda } from '@/types/bloqueio';
import type { Coluna } from '@/types/tabela';
import { useCarregarLista } from '@/hooks/useCarregarLista';
import { useTabelaLocal } from '@/hooks/useTabelaLocal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { BarraDeFiltros } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

// '2026-12-25' -> '25/12/2026'
const formatarData = (data: string) => data.split('-').reverse().join('/');

function descreverPeriodo(b: BloqueioAgenda) {
  return b.dataInicio === b.dataFim
    ? formatarData(b.dataInicio)
    : `${formatarData(b.dataInicio)} a ${formatarData(b.dataFim)}`;
}

const nomeDoBarbeiro = (b: BloqueioAgenda) => b.profissional?.nome ?? 'Todos os barbeiros';

const COLUNAS: Coluna<BloqueioAgenda>[] = [
  {
    chave: 'periodo',
    titulo: 'Período',
    ordenavel: true,
    valor: (b) => b.dataInicio,
    className: 'whitespace-nowrap',
    render: (b) => (
      <span className="font-medium">
        {descreverPeriodo(b)}
        {b.dataInicio <= hojeLocal() && (
          <span className="ml-2 rounded-full bg-copper/15 px-2 py-0.5 text-xs font-normal text-copper">
            em andamento
          </span>
        )}
      </span>
    ),
  },
  {
    chave: 'barbeiro',
    titulo: 'Barbeiro',
    ordenavel: true,
    valor: nomeDoBarbeiro,
    render: (b) =>
      b.profissional ? (
        nomeDoBarbeiro(b)
      ) : (
        <span className="text-white/70">{nomeDoBarbeiro(b)}</span>
      ),
  },
  {
    chave: 'motivo',
    titulo: 'Motivo',
    render: (b) => <span className="text-white/80">{b.motivo}</span>,
  },
];

const textoBusca = (b: BloqueioAgenda) => `${nomeDoBarbeiro(b)} ${b.motivo} ${descreverPeriodo(b)}`;

interface Props {
  // Chamado depois de remover um bloqueio, para o calendário atualizar também.
  aoMudar: () => void;
}

// Bloqueios de agenda em andamento ou futuros (feriados e ausências). Nesses
// dias o app não oferece horários e a API recusa novos agendamentos.
export function ListaBloqueios({ aoMudar }: Props) {
  const avisos = useAvisos();
  const confirmar = useConfirmar();

  const { dados, carregando, erro, recarregar } = useCarregarLista(
    listarBloqueios,
    'Não foi possível carregar os bloqueios. Verifique se a API está no ar.',
  );
  const tabela = useTabelaLocal(dados, {
    colunas: COLUNAS,
    textoBusca,
    ordenacaoInicial: { chave: 'periodo', direcao: 'asc' },
  });

  async function handleExcluir(bloqueio: BloqueioAgenda) {
    const ok = await confirmar({
      titulo: 'Liberar a agenda',
      mensagem: `Remover o bloqueio de ${descreverPeriodo(bloqueio)} (${nomeDoBarbeiro(bloqueio)}, "${bloqueio.motivo}")? Os clientes voltam a poder agendar nesses dias.`,
      textoConfirmar: 'Liberar agenda',
    });
    if (!ok) return;

    try {
      await excluirBloqueio(bloqueio.id);
      avisos.sucesso('Bloqueio removido. A agenda está liberada.');
      aoMudar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível remover o bloqueio.');
      await recarregar();
    }
  }

  return (
    <div>
      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por barbeiro, motivo ou data"
        ativos={tabela.filtrando}
        aoLimpar={() => tabela.setBusca('')}
      />

      <TabelaDados
        colunas={COLUNAS}
        linhas={tabela.linhas}
        chaveLinha={(b) => b.id}
        carregando={carregando}
        erro={erro}
        aoTentarNovamente={recarregar}
        mensagemVazia="Nenhum bloqueio ativo. A agenda está aberta em todos os dias de atendimento."
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
        acoes={(b) => (
          <BotaoIcone
            icone="excluir"
            titulo="Remover bloqueio"
            tom="vermelho"
            onClick={() => handleExcluir(b)}
          />
        )}
      />
    </div>
  );
}
