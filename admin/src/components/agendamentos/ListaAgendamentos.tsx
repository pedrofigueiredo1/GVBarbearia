'use client';

import { useEffect, useRef, useState } from 'react';
import { listarAgendamentosPaginado } from '@/lib/agendamentos';
import { formatarDataHora, formatarMoeda } from '@/lib/formatar';
import { limitesDosDias, somarDias } from '@/lib/datas';
import { listarProfissionais } from '@/lib/profissionais';
import { listarServicos } from '@/lib/servicos';
import { useTabelaServidor } from '@/hooks/useTabelaServidor';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { EtiquetaStatus } from '@/components/ui/EtiquetaStatus';
import { BarraDeFiltros, DataFiltro, SelectFiltro } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';
import { STATUS_LABEL, type Agendamento, type StatusAgendamento } from '@/types/agendamento';
import type { Profissional } from '@/types/profissional';
import type { Servico } from '@/types/servico';
import type { Coluna } from '@/types/tabela';

interface Props {
  // Muda quando algo foi salvo/cancelado, para a lista buscar de novo.
  versao: number;
  aoEditar: (agendamento: Agendamento) => void;
  aoConfirmar: (agendamento: Agendamento) => void;
  aoConcluir: (agendamento: Agendamento) => void;
  aoCancelar: (agendamento: Agendamento) => void;
}

const COLUNAS: Coluna<Agendamento>[] = [
  {
    chave: 'cliente',
    titulo: 'Cliente',
    render: (a) => <span className="font-medium">{a.cliente.nome}</span>,
  },
  {
    chave: 'servico',
    titulo: 'Serviço',
    render: (a) => (
      <>
        {a.servico.nome} <span className="text-white/50">({formatarMoeda(a.servico.valor)})</span>
      </>
    ),
  },
  { chave: 'profissional', titulo: 'Profissional', render: (a) => a.profissional.nome },
  {
    chave: 'dataHora',
    titulo: 'Data/Hora',
    ordenavel: true,
    className: 'whitespace-nowrap',
    render: (a) => formatarDataHora(a.dataHora),
  },
  { chave: 'status', titulo: 'Status', render: (a) => <EtiquetaStatus status={a.status} /> },
];

// Lista de agendamentos paginada no servidor, com busca (cliente, serviço ou
// profissional) e filtros de situação, profissional, serviço e período.
export function ListaAgendamentos({ versao, aoEditar, aoConfirmar, aoConcluir, aoCancelar }: Props) {
  const [status, setStatus] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    Promise.all([listarProfissionais(), listarServicos()])
      .then(([p, s]) => {
        setProfissionais(p);
        setServicos(s);
      })
      .catch(() => undefined); // sem as opções, os filtros só ficam vazios
  }, []);

  const periodo = {
    dataInicio: de ? limitesDosDias(de, somarDias(de, 1)).dataInicio : undefined,
    dataFim: ate ? limitesDosDias(ate, somarDias(ate, 1)).dataFim : undefined,
  };

  const tabela = useTabelaServidor<Agendamento>(
    listarAgendamentosPaginado,
    {
      status: status || undefined,
      profissionalId: profissionalId || undefined,
      servicoId: servicoId || undefined,
      ...periodo,
    },
    {
      ordenacaoInicial: { chave: 'dataHora', direcao: 'desc' },
      mensagemErro: 'Não foi possível carregar os agendamentos. Verifique se a API está no ar.',
    },
  );

  // Recarrega quando algo mudou fora da lista (salvar, cancelar, confirmar).
  const primeiraVez = useRef(true);
  useEffect(() => {
    if (primeiraVez.current) {
      primeiraVez.current = false;
      return;
    }
    tabela.recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao]);

  function limpar() {
    tabela.limparBusca();
    setStatus('');
    setProfissionalId('');
    setServicoId('');
    setDe('');
    setAte('');
  }

  return (
    <div>
      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por cliente, serviço ou profissional"
        ativos={tabela.filtrando || tabela.busca !== ''}
        aoLimpar={limpar}
      >
        <SelectFiltro rotulo="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option>
          {(Object.keys(STATUS_LABEL) as StatusAgendamento[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </SelectFiltro>
        <SelectFiltro
          rotulo="Profissional"
          value={profissionalId}
          onChange={(e) => setProfissionalId(e.target.value)}
        >
          <option value="">Todos</option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </SelectFiltro>
        <SelectFiltro rotulo="Serviço" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          <option value="">Todos</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </SelectFiltro>
        <DataFiltro rotulo="De" valor={de} aoMudar={setDe} />
        <DataFiltro rotulo="Até" valor={ate} aoMudar={setAte} />
      </BarraDeFiltros>

      <TabelaDados
        colunas={COLUNAS}
        linhas={tabela.linhas}
        chaveLinha={(a) => a.id}
        carregando={tabela.carregando}
        erro={tabela.erro}
        aoTentarNovamente={tabela.recarregar}
        mensagemVazia="Nenhum agendamento cadastrado."
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
            {a.status === 'PENDENTE' && (
              <BotaoIcone icone="confirmar" titulo="Confirmar agendamento" tom="cobre" onClick={() => aoConfirmar(a)} />
            )}
            {(a.status === 'PENDENTE' || a.status === 'CONFIRMADO') && new Date(a.dataHora).getTime() <= Date.now() && (
              <BotaoIcone icone="concluir" titulo="Concluir atendimento" tom="verde" onClick={() => aoConcluir(a)} />
            )}
            <BotaoIcone icone="editar" titulo="Editar agendamento" onClick={() => aoEditar(a)} />
            {(a.status === 'PENDENTE' || a.status === 'CONFIRMADO') && (
              <BotaoIcone icone="cancelar" titulo="Cancelar agendamento" tom="vermelho" onClick={() => aoCancelar(a)} />
            )}
          </>
        )}
      />
    </div>
  );
}
