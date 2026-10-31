'use client';

import { useCallback, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api';
import { editarAvaliacao, excluirAvaliacao, listarAvaliacoes } from '@/lib/avaliacoes';
import type { Avaliacao, AvaliacaoInput } from '@/types/avaliacao';
import type { Coluna } from '@/types/tabela';
import { useCarregarLista } from '@/hooks/useCarregarLista';
import { useTabelaLocal } from '@/hooks/useTabelaLocal';
import { AvaliacaoFormModal } from '@/components/AvaliacaoFormModal';
import { useAvisos, useConfirmar } from '@/components/ui/Avisos';
import { BotaoIcone } from '@/components/ui/BotaoIcone';
import { CabecalhoPagina } from '@/components/ui/CabecalhoPagina';
import { BarraDeFiltros, SelectFiltro } from '@/components/ui/Filtros';
import { TabelaDados } from '@/components/ui/TabelaDados';

const Estrelas = ({ nota }: { nota: number }) => (
  <span className="whitespace-nowrap text-copper" title={`${nota} de 5`}>
    {'★'.repeat(nota)}
    <span className="text-white/20">{'★'.repeat(5 - nota)}</span>
  </span>
);

const COLUNAS: Coluna<Avaliacao>[] = [
  {
    chave: 'autor',
    titulo: 'Autor',
    ordenavel: true,
    valor: (a) => a.agendamento.cliente.nome,
    render: (a) => <span className="font-medium">{a.agendamento.cliente.nome}</span>,
  },
  {
    chave: 'servico',
    titulo: 'Serviço',
    ordenavel: true,
    valor: (a) => a.agendamento.servico.nome,
    render: (a) => a.agendamento.servico.nome,
  },
  {
    chave: 'profissional',
    titulo: 'Profissional',
    ordenavel: true,
    valor: (a) => a.agendamento.profissional.nome,
    render: (a) => a.agendamento.profissional.nome,
  },
  {
    chave: 'nota',
    titulo: 'Nota',
    ordenavel: true,
    valor: (a) => a.nota,
    render: (a) => <Estrelas nota={a.nota} />,
  },
  {
    chave: 'comentario',
    titulo: 'Comentário',
    className: 'max-w-xs',
    render: (a) => (
      <span className="block truncate text-white/70" title={a.comentario}>
        {a.comentario}
      </span>
    ),
  },
  {
    chave: 'data',
    titulo: 'Data',
    ordenavel: true,
    valor: (a) => a.criadoEm,
    className: 'whitespace-nowrap',
    render: (a) => new Date(a.criadoEm).toLocaleDateString('pt-BR'),
  },
];

const textoBusca = (a: Avaliacao) =>
  `${a.agendamento.cliente.nome} ${a.agendamento.servico.nome} ${a.agendamento.profissional.nome} ${a.comentario}`;

// Edição e exclusão de avaliações. O cadastro é feito pelo cliente no app.
export default function AvaliacoesPage() {
  const avisos = useAvisos();
  const confirmar = useConfirmar();
  const [avaliacaoEmEdicao, setAvaliacaoEmEdicao] = useState<Avaliacao | null>(null);
  const [nota, setNota] = useState('');
  const [profissionalId, setProfissionalId] = useState('');

  const { dados, carregando, erro, recarregar } = useCarregarLista(
    listarAvaliacoes,
    'Não foi possível carregar as avaliações. Verifique se a API está no ar.',
  );

  // Profissionais que aparecem nas avaliações, para o filtro.
  const profissionais = useMemo(() => {
    const mapa = new Map<number, string>();
    dados.forEach((a) => mapa.set(a.agendamento.profissional.id, a.agendamento.profissional.nome));
    return [...mapa.entries()].sort((x, y) => x[1].localeCompare(y[1], 'pt-BR'));
  }, [dados]);

  const filtro = useCallback(
    (a: Avaliacao) =>
      (nota === '' || a.nota === Number(nota)) &&
      (profissionalId === '' || a.agendamento.profissional.id === Number(profissionalId)),
    [nota, profissionalId],
  );

  const tabela = useTabelaLocal(dados, {
    colunas: COLUNAS,
    textoBusca,
    filtro,
    ordenacaoInicial: { chave: 'data', direcao: 'desc' },
  });

  function limpar() {
    tabela.setBusca('');
    setNota('');
    setProfissionalId('');
    tabela.voltarParaPrimeira();
  }

  async function handleSalvar(data: AvaliacaoInput) {
    if (!avaliacaoEmEdicao) return;
    await editarAvaliacao(avaliacaoEmEdicao.id, data);
    setAvaliacaoEmEdicao(null);
    avisos.sucesso('Avaliação atualizada.');
    await recarregar();
  }

  async function handleExcluir(avaliacao: Avaliacao) {
    const ok = await confirmar({
      titulo: 'Excluir avaliação',
      mensagem: `Excluir a avaliação de "${avaliacao.agendamento.cliente.nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    });
    if (!ok) return;

    try {
      await excluirAvaliacao(avaliacao.id);
      avisos.sucesso('Avaliação excluída.');
      await recarregar();
    } catch (err) {
      avisos.erro(err instanceof ApiError ? err.message : 'Não foi possível excluir a avaliação.');
    }
  }

  return (
    <div>
      <CabecalhoPagina
        titulo="Avaliações"
        subtitulo="O que os clientes acharam dos atendimentos."
      />

      <BarraDeFiltros
        busca={tabela.busca}
        aoBuscar={tabela.setBusca}
        placeholderBusca="Buscar por cliente, serviço ou comentário"
        ativos={tabela.filtrando}
        aoLimpar={limpar}
      >
        <SelectFiltro
          rotulo="Nota"
          value={nota}
          onChange={(e) => {
            setNota(e.target.value);
            tabela.voltarParaPrimeira();
          }}
        >
          <option value="">Todas</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'estrela' : 'estrelas'}
            </option>
          ))}
        </SelectFiltro>
        <SelectFiltro
          rotulo="Profissional"
          value={profissionalId}
          onChange={(e) => {
            setProfissionalId(e.target.value);
            tabela.voltarParaPrimeira();
          }}
        >
          <option value="">Todos</option>
          {profissionais.map(([id, nome]) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </SelectFiltro>
      </BarraDeFiltros>

      <TabelaDados
        colunas={COLUNAS}
        linhas={tabela.linhas}
        chaveLinha={(a) => a.id}
        carregando={carregando}
        erro={erro}
        aoTentarNovamente={recarregar}
        mensagemVazia="Nenhuma avaliação registrada."
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
              titulo={`Editar avaliação de ${a.agendamento.cliente.nome}`}
              onClick={() => setAvaliacaoEmEdicao(a)}
            />
            <BotaoIcone
              icone="excluir"
              titulo={`Excluir avaliação de ${a.agendamento.cliente.nome}`}
              tom="vermelho"
              onClick={() => handleExcluir(a)}
            />
          </>
        )}
      />

      {avaliacaoEmEdicao && (
        <AvaliacaoFormModal
          avaliacao={avaliacaoEmEdicao}
          onClose={() => setAvaliacaoEmEdicao(null)}
          onSalvar={handleSalvar}
        />
      )}
    </div>
  );
}
