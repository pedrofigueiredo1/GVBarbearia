'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { listarClientes } from '@/lib/clientes';
import { listarServicos } from '@/lib/servicos';
import { listarProfissionais } from '@/lib/profissionais';
import {
  exportarAgendamentosCsv,
  gerarRelatorioAgendamentos,
} from '@/lib/relatorios';
import type { Cliente } from '@/types/cliente';
import type { Servico } from '@/types/servico';
import type { Profissional } from '@/types/profissional';
import { STATUS_LABEL, type StatusAgendamento } from '@/types/agendamento';
import type { FiltrosRelatorio, RelatorioAgendamentos } from '@/types/relatorio';

interface FormFiltros {
  dataInicio: string;
  dataFim: string;
  clienteId: string;
  servicoId: string;
  profissionalId: string;
}

const FORM_VAZIO: FormFiltros = {
  dataInicio: '',
  dataFim: '',
  clienteId: '',
  servicoId: '',
  profissionalId: '',
};

const STATUS_ORDEM: StatusAgendamento[] = ['CONFIRMADO', 'CONCLUIDO', 'CANCELADO', 'PENDENTE'];

// O formulário trabalha com datas (AAAA-MM-DD) e converte para o intervalo
// completo do dia, no fuso local — mesma convenção do formulário de agendamento.
function paraFiltros(form: FormFiltros): FiltrosRelatorio {
  return {
    dataInicio: form.dataInicio ? new Date(`${form.dataInicio}T00:00:00`).toISOString() : undefined,
    dataFim: form.dataFim ? new Date(`${form.dataFim}T23:59:59.999`).toISOString() : undefined,
    clienteId: form.clienteId ? Number(form.clienteId) : undefined,
    servicoId: form.servicoId ? Number(form.servicoId) : undefined,
    profissionalId: form.profissionalId ? Number(form.profissionalId) : undefined,
  };
}

export default function RelatorioAgendamentosPage() {
  const [form, setForm] = useState<FormFiltros>(FORM_VAZIO);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioAgendamentos | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar(filtros: FiltrosRelatorio) {
    setCarregando(true);
    setErro(null);
    try {
      setRelatorio(await gerarRelatorioAgendamentos(filtros));
    } catch (err) {
      setErro(
        err instanceof ApiError ? err.message : 'Não foi possível gerar o relatório.',
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    Promise.all([listarClientes(), listarServicos(), listarProfissionais()]).then(
      ([c, s, p]) => {
        setClientes(c);
        setServicos(s);
        setProfissionais(p);
      },
    );
    gerar({});
  }, []);

  function handleGerar(event: FormEvent) {
    event.preventDefault();
    gerar(paraFiltros(form));
  }

  function handleLimpar() {
    setForm(FORM_VAZIO);
    gerar({});
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Relatório de Agendamentos</h2>

      <form
        onSubmit={handleGerar}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 items-end"
      >
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dataInicio">
            Data inicial
          </label>
          <input
            id="dataInicio"
            type="date"
            className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            value={form.dataInicio}
            onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dataFim">
            Data final
          </label>
          <input
            id="dataFim"
            type="date"
            className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            value={form.dataFim}
            onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="clienteId">
            Cliente
          </label>
          <select
            id="clienteId"
            className="w-full rounded border border-black/15 dark:border-white/20 bg-background text-foreground px-3 py-2 text-sm"
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
          >
            <option value="">Todos</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
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
            className="w-full rounded border border-black/15 dark:border-white/20 bg-background text-foreground px-3 py-2 text-sm"
            value={form.servicoId}
            onChange={(e) => setForm({ ...form, servicoId: e.target.value })}
          >
            <option value="">Todos</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="profissionalId">
            Profissional
          </label>
          <select
            id="profissionalId"
            className="w-full rounded border border-black/15 dark:border-white/20 bg-background text-foreground px-3 py-2 text-sm"
            value={form.profissionalId}
            onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
          >
            <option value="">Todos</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleLimpar}
            className="rounded px-4 py-2 text-sm border border-black/15 dark:border-white/20"
          >
            Limpar filtros
          </button>
          <button
            type="submit"
            disabled={carregando}
            className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {carregando ? 'Gerando...' : 'Gerar relatório'}
          </button>
        </div>
      </form>

      {erro && <p className="text-sm text-red-600 border border-red-200 rounded p-3">{erro}</p>}

      {relatorio && !erro && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {STATUS_ORDEM.map((status) => (
              <div
                key={status}
                className="rounded border border-black/10 dark:border-white/15 p-4"
              >
                <p className="text-sm text-black/60 dark:text-white/60">{STATUS_LABEL[status]}</p>
                <p className="text-2xl font-semibold">{relatorio.totais[status]}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-black/60 dark:text-white/60">
              {relatorio.total} agendamento(s) no período
            </p>
            <button
              onClick={() => exportarAgendamentosCsv(relatorio.agendamentos)}
              disabled={relatorio.total === 0}
              className="rounded border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Exportar CSV
            </button>
          </div>

          {relatorio.total === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/60">
              Não há agendamentos para o período selecionado.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-black/10 dark:border-white/15">
                  <th className="py-2 pr-4 font-medium">Data e horário</th>
                  <th className="py-2 pr-4 font-medium">Cliente</th>
                  <th className="py-2 pr-4 font-medium">Serviço</th>
                  <th className="py-2 pr-4 font-medium">Profissional</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.agendamentos.map((a) => (
                  <tr key={a.id} className="border-b border-black/5 dark:border-white/10">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(a.dataHora).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2 pr-4">{a.cliente.nome}</td>
                    <td className="py-2 pr-4">{a.servico.nome}</td>
                    <td className="py-2 pr-4">{a.profissional.nome}</td>
                    <td className="py-2 pr-4">{STATUS_LABEL[a.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
