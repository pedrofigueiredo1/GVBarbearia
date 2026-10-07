'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { listarServicos } from '@/lib/servicos';
import { listarProfissionais } from '@/lib/profissionais';
import {
  SEM_FILTROS,
  descreverFiltros,
  exportarAvaliacoesPdf,
  gerarRelatorioAvaliacoes,
} from '@/lib/relatorios';
import type { Servico } from '@/types/servico';
import type { Profissional } from '@/types/profissional';
import type { FiltrosRelatorio, RelatorioAvaliacoes } from '@/types/relatorio';

const NOTAS = [5, 4, 3, 2, 1];

// Mesma convenção dos outros relatórios: dia inteiro, fuso local. O período
// filtra pela data em que a avaliação foi registrada.
function paraFiltros(
  dataInicio: string,
  dataFim: string,
  profissionalId: string,
  servicoId: string,
): FiltrosRelatorio {
  return {
    dataInicio: dataInicio ? new Date(`${dataInicio}T00:00:00`).toISOString() : undefined,
    dataFim: dataFim ? new Date(`${dataFim}T23:59:59.999`).toISOString() : undefined,
    profissionalId: profissionalId ? Number(profissionalId) : undefined,
    servicoId: servicoId ? Number(servicoId) : undefined,
  };
}

export default function RelatorioAvaliacoesPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioAvaliacoes | null>(null);
  const [descricaoFiltros, setDescricaoFiltros] = useState<string[]>([SEM_FILTROS]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar(filtros: FiltrosRelatorio, descricao: string[] = [SEM_FILTROS]) {
    setCarregando(true);
    setErro(null);
    try {
      setRelatorio(await gerarRelatorioAvaliacoes(filtros));
      setDescricaoFiltros(descricao);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível gerar o relatório.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    Promise.all([listarProfissionais(), listarServicos()]).then(([p, s]) => {
      setProfissionais(p);
      setServicos(s);
    });
    gerar({});
  }, []);

  function handleGerar(event: FormEvent) {
    event.preventDefault();
    gerar(
      paraFiltros(dataInicio, dataFim, profissionalId, servicoId),
      descreverFiltros(dataInicio, dataFim, [
        ['Profissional', profissionais.find((p) => String(p.id) === profissionalId)?.nome],
        ['Serviço', servicos.find((s) => String(s.id) === servicoId)?.nome],
      ]),
    );
  }

  const maiorQuantidade = relatorio ? Math.max(...NOTAS.map((n) => relatorio.distribuicao[n])) : 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Relatório de Avaliações</h2>

      <form onSubmit={handleGerar} className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dataInicio">
            Data inicial
          </label>
          <input
            id="dataInicio"
            type="date"
            className="rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dataFim">
            Data final
          </label>
          <input
            id="dataFim"
            type="date"
            className="rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="profissionalId">
            Profissional
          </label>
          <select
            id="profissionalId"
            className="rounded border border-black/15 dark:border-white/20 bg-background text-foreground px-3 py-2 text-sm"
            value={profissionalId}
            onChange={(e) => setProfissionalId(e.target.value)}
          >
            <option value="">Todos</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="servicoId">
            Serviço
          </label>
          <select
            id="servicoId"
            className="rounded border border-black/15 dark:border-white/20 bg-background text-foreground px-3 py-2 text-sm"
            value={servicoId}
            onChange={(e) => setServicoId(e.target.value)}
          >
            <option value="">Todos</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={carregando}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {carregando ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </form>

      {erro && <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>}

      {relatorio && !erro && relatorio.total === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Não há avaliações registradas para os filtros selecionados.
        </p>
      )}

      {relatorio && !erro && relatorio.total > 0 && (
        <>
          <div className="flex justify-end mb-3">
            <button
              onClick={() => exportarAvaliacoesPdf(relatorio, descricaoFiltros)}
              className="rounded bg-foreground text-background px-3 py-1.5 text-sm font-medium"
            >
              Exportar PDF
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="rounded border border-black/10 dark:border-white/15 p-4">
              <p className="text-sm text-black/60 dark:text-white/60">Média geral</p>
              <p className="text-2xl font-semibold">
                {relatorio.mediaGeral?.toFixed(2).replace('.', ',')} / 5
              </p>
            </div>
            <div className="rounded border border-black/10 dark:border-white/15 p-4">
              <p className="text-sm text-black/60 dark:text-white/60">Avaliações registradas</p>
              <p className="text-2xl font-semibold">{relatorio.total}</p>
            </div>
          </div>

          <h3 className="font-medium mb-3">Distribuição das notas</h3>
          <div className="flex flex-col gap-2 mb-8 max-w-xl">
            {NOTAS.map((nota) => {
              const quantidade = relatorio.distribuicao[nota];
              const largura = maiorQuantidade > 0 ? (quantidade / maiorQuantidade) * 100 : 0;
              return (
                <div key={nota} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0">{nota} estrela{nota > 1 ? 's' : ''}</span>
                  <div className="flex-1 h-4 rounded bg-black/5 dark:bg-white/10">
                    <div
                      className="h-4 rounded bg-foreground"
                      style={{ width: `${largura}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{quantidade}</span>
                </div>
              );
            })}
          </div>

          <h3 className="font-medium mb-3">Comentários mais recentes</h3>
          <ul className="flex flex-col gap-3">
            {relatorio.comentariosRecentes.map((c) => (
              <li
                key={c.id}
                className="rounded border border-black/10 dark:border-white/15 p-3 text-sm"
              >
                <p className="font-medium">
                  {c.nota}/5 — {c.cliente}
                </p>
                <p className="text-black/60 dark:text-white/60 text-xs mb-1">
                  {c.servico} com {c.profissional} · {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                </p>
                <p>{c.comentario}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
