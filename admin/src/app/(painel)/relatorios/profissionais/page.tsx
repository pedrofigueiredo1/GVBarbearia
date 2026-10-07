'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { listarProfissionais } from '@/lib/profissionais';
import {
  SEM_FILTROS,
  descreverFiltros,
  exportarAtendimentoProfissionalPdf,
  gerarRelatorioAtendimentoProfissional,
} from '@/lib/relatorios';
import type { Profissional } from '@/types/profissional';
import type { FiltrosRelatorio, RelatorioAtendimentoProfissional } from '@/types/relatorio';

// Mesma convenção dos outros relatórios: dia inteiro, fuso local.
function paraFiltros(dataInicio: string, dataFim: string, profissionalId: string): FiltrosRelatorio {
  return {
    dataInicio: dataInicio ? new Date(`${dataInicio}T00:00:00`).toISOString() : undefined,
    dataFim: dataFim ? new Date(`${dataFim}T23:59:59.999`).toISOString() : undefined,
    profissionalId: profissionalId ? Number(profissionalId) : undefined,
  };
}

export default function RelatorioAtendimentoProfissionalPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioAtendimentoProfissional | null>(null);
  const [descricaoFiltros, setDescricaoFiltros] = useState<string[]>([SEM_FILTROS]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar(filtros: FiltrosRelatorio, descricao: string[] = [SEM_FILTROS]) {
    setCarregando(true);
    setErro(null);
    try {
      setRelatorio(await gerarRelatorioAtendimentoProfissional(filtros));
      setDescricaoFiltros(descricao);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível gerar o relatório.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    listarProfissionais().then(setProfissionais);
    gerar({});
  }, []);

  function handleGerar(event: FormEvent) {
    event.preventDefault();
    gerar(
      paraFiltros(dataInicio, dataFim, profissionalId),
      descreverFiltros(dataInicio, dataFim, [
        ['Profissional', profissionais.find((p) => String(p.id) === profissionalId)?.nome],
      ]),
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Atendimento por profissional</h2>

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
        <button
          type="submit"
          disabled={carregando}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {carregando ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </form>

      {erro && <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>}

      {relatorio && !erro && relatorio.totalAtendimentos === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Não há atendimentos concluídos para o período selecionado.
        </p>
      )}

      {relatorio && !erro && relatorio.totalAtendimentos > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-black/60 dark:text-white/60">
              {relatorio.totalAtendimentos} atendimento(s) concluído(s) no período
            </p>
            <button
              onClick={() => exportarAtendimentoProfissionalPdf(relatorio, descricaoFiltros)}
              className="rounded bg-foreground text-background px-3 py-1.5 text-sm font-medium"
            >
              Exportar PDF
            </button>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-black/10 dark:border-white/15">
                <th className="py-2 pr-4 font-medium">Profissional</th>
                <th className="py-2 pr-4 font-medium">Atendimentos</th>
                <th className="py-2 pr-4 font-medium">Serviços mais realizados</th>
                <th className="py-2 pr-4 font-medium">Avaliação média</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.profissionais.map((p) => (
                <tr key={p.profissionalId} className="border-b border-black/5 dark:border-white/10 align-top">
                  <td className="py-2 pr-4">
                    {p.nome}
                    <span className="block text-xs text-black/60 dark:text-white/60">
                      {p.especialidade}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{p.atendimentos}</td>
                  <td className="py-2 pr-4">
                    {p.servicosMaisRealizados.length === 0
                      ? '-'
                      : p.servicosMaisRealizados.map((s) => `${s.nome} (${s.quantidade})`).join(', ')}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {p.avaliacaoMedia === null
                      ? 'Sem avaliações'
                      : `${p.avaliacaoMedia.toFixed(2).replace('.', ',')} (${p.totalAvaliacoes})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
