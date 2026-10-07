'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  SEM_FILTROS,
  descreverFiltros,
  exportarClientesPdf,
  gerarRelatorioClientes,
} from '@/lib/relatorios';
import type { FiltrosRelatorio, RelatorioClientes } from '@/types/relatorio';

// O período filtra só os "novos clientes" (data de cadastro); a tabela
// sempre mostra todos os clientes com os dados atuais.
function paraFiltros(dataInicio: string, dataFim: string): FiltrosRelatorio {
  return {
    dataInicio: dataInicio ? new Date(`${dataInicio}T00:00:00`).toISOString() : undefined,
    dataFim: dataFim ? new Date(`${dataFim}T23:59:59.999`).toISOString() : undefined,
  };
}

export default function RelatorioClientesPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [relatorio, setRelatorio] = useState<RelatorioClientes | null>(null);
  const [descricaoFiltros, setDescricaoFiltros] = useState<string[]>([SEM_FILTROS]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar(filtros: FiltrosRelatorio, descricao: string[] = [SEM_FILTROS]) {
    setCarregando(true);
    setErro(null);
    try {
      setRelatorio(await gerarRelatorioClientes(filtros));
      setDescricaoFiltros(descricao);
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
    gerar(
      paraFiltros(dataInicio, dataFim),
      descreverFiltros(dataInicio, dataFim, [], 'Clientes cadastrados'),
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Relatório de Clientes</h2>

      <form onSubmit={handleGerar} className="flex flex-wrap gap-3 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dataInicio">
            Cadastrados a partir de
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
            Cadastrados até
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

      {relatorio && !erro && relatorio.totalClientes === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">Não há clientes cadastrados.</p>
      )}

      {relatorio && !erro && relatorio.totalClientes > 0 && (
        <>
          <div className="flex justify-end mb-3">
            <button
              onClick={() => exportarClientesPdf(relatorio, descricaoFiltros)}
              className="rounded bg-foreground text-background px-3 py-1.5 text-sm font-medium"
            >
              Exportar PDF
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded border border-black/10 dark:border-white/15 p-4">
              <p className="text-sm text-black/60 dark:text-white/60">Clientes cadastrados</p>
              <p className="text-2xl font-semibold">{relatorio.totalClientes}</p>
            </div>
            <div className="rounded border border-black/10 dark:border-white/15 p-4">
              <p className="text-sm text-black/60 dark:text-white/60">Novos no período</p>
              <p className="text-2xl font-semibold">{relatorio.novosNoPeriodo}</p>
            </div>
            <div className="rounded border border-black/10 dark:border-white/15 p-4">
              <p className="text-sm text-black/60 dark:text-white/60">
                Frequentes (5+ concluídos)
              </p>
              <p className="text-2xl font-semibold">{relatorio.totalFrequentes}</p>
            </div>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-black/10 dark:border-white/15">
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Cadastro</th>
                <th className="py-2 pr-4 font-medium">Agendamentos</th>
                <th className="py-2 pr-4 font-medium">Concluídos</th>
                <th className="py-2 pr-4 font-medium">Último agendamento</th>
                <th className="py-2 pr-4 font-medium">Frequente</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.clientes.map((c) => (
                <tr key={c.clienteId} className="border-b border-black/5 dark:border-white/10">
                  <td className="py-2 pr-4">
                    {c.nome}
                    <span className="block text-xs text-black/60 dark:text-white/60">{c.email}</span>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-2 pr-4">{c.totalAgendamentos}</td>
                  <td className="py-2 pr-4">{c.agendamentosConcluidos}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {c.ultimoAgendamento
                      ? new Date(c.ultimoAgendamento).toLocaleString('pt-BR')
                      : 'Nenhum'}
                  </td>
                  <td className="py-2 pr-4">{c.frequente ? 'Sim' : 'Não'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
