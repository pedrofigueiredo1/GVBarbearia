'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { gerarRelatorioServicosMaisAgendados } from '@/lib/relatorios';
import type { ServicoMaisAgendado } from '@/types/relatorio';

const formatarValor = (valor: string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));

// Mesma convenção de intervalo do relatório de agendamentos: dia inteiro, fuso local.
function paraFiltros(dataInicio: string, dataFim: string) {
  return {
    dataInicio: dataInicio ? new Date(`${dataInicio}T00:00:00`).toISOString() : undefined,
    dataFim: dataFim ? new Date(`${dataFim}T23:59:59.999`).toISOString() : undefined,
  };
}

export default function RelatorioServicosPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [ranking, setRanking] = useState<ServicoMaisAgendado[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar(filtros: { dataInicio?: string; dataFim?: string }) {
    setCarregando(true);
    setErro(null);
    try {
      setRanking(await gerarRelatorioServicosMaisAgendados(filtros));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível gerar o relatório.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    gerar({});
  }, []);

  function handleGerar(event: FormEvent) {
    event.preventDefault();
    gerar(paraFiltros(dataInicio, dataFim));
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Serviços mais agendados</h2>

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
        <button
          type="submit"
          disabled={carregando}
          className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {carregando ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </form>

      {erro && <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>}

      {ranking && !erro && ranking.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Nenhum serviço foi agendado no período selecionado.
        </p>
      )}

      {ranking && !erro && ranking.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/15">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Serviço</th>
              <th className="py-2 pr-4 font-medium">Agendamentos</th>
              <th className="py-2 pr-4 font-medium">Valor total estimado</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item, indice) => (
              <tr key={item.servicoId} className="border-b border-black/5 dark:border-white/10">
                <td className="py-2 pr-4">{indice + 1}</td>
                <td className="py-2 pr-4">{item.nome}</td>
                <td className="py-2 pr-4">{item.quantidade}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{formatarValor(item.valorTotalEstimado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
