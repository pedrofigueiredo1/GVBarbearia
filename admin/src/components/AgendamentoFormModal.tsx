'use client';

import { FormEvent, useEffect, useState } from 'react';
import { listarClientes } from '@/lib/clientes';
import { listarServicos } from '@/lib/servicos';
import { listarProfissionais } from '@/lib/profissionais';
import type { Cliente } from '@/types/cliente';
import type { Servico } from '@/types/servico';
import type { Profissional } from '@/types/profissional';
import type {
  Agendamento,
  CreateAgendamentoInput,
  StatusAgendamento,
  UpdateAgendamentoInput,
} from '@/types/agendamento';
import { STATUS_LABEL } from '@/types/agendamento';

interface Props {
  agendamento?: Agendamento | null;
  onClose: () => void;
  onSalvar: (data: CreateAgendamentoInput | UpdateAgendamentoInput) => Promise<void>;
}

// Separa a dataHora (ISO, em UTC) em data/hora usando o fuso LOCAL do
// navegador — como admin e barbearia operam no mesmo fuso, isso é
// suficiente e evita o trabalho de modelar timezone explicitamente.
function paraCamposLocais(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function paraIso(data: string, hora: string) {
  return new Date(`${data}T${hora}`).toISOString();
}

const STATUS_OPCOES: StatusAgendamento[] = ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'];

// Um único modal serve tanto para o cadastro pelo admin (regra de negócio
// não documentada, combinada com Pedro — atendimento presencial de quem
// prefere não usar o app) quanto para a edição. `status` só aparece na
// edição: no cadastro ele é sempre definido como CONFIRMADO pelo backend.
export function AgendamentoFormModal({ agendamento, onClose, onSalvar }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);

  const camposIniciais = agendamento
    ? paraCamposLocais(agendamento.dataHora)
    : { data: '', hora: '' };

  const [form, setForm] = useState({
    clienteId: agendamento?.clienteId ?? '',
    servicoId: agendamento?.servicoId ?? '',
    profissionalId: agendamento?.profissionalId ?? '',
    data: camposIniciais.data,
    hora: camposIniciais.hora,
    status: agendamento?.status ?? 'CONFIRMADO',
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([listarClientes(), listarServicos(), listarProfissionais()])
      .then(([c, s, p]) => {
        setClientes(c);
        setServicos(s);
        setProfissionais(p);
      })
      .finally(() => setCarregandoOpcoes(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const dataHora = paraIso(form.data, form.hora);

      if (agendamento) {
        await onSalvar({
          clienteId: Number(form.clienteId),
          servicoId: Number(form.servicoId),
          profissionalId: Number(form.profissionalId),
          dataHora,
          status: form.status,
        });
      } else {
        await onSalvar({
          clienteId: Number(form.clienteId),
          servicoId: Number(form.servicoId),
          profissionalId: Number(form.profissionalId),
          dataHora,
        });
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md p-6 border border-black/10 dark:border-white/15 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {agendamento ? 'Editar agendamento' : 'Novo agendamento'}
        </h3>

        {carregandoOpcoes ? (
          <p className="text-sm text-black/60 dark:text-white/60">Carregando opções...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="clienteId">
                Cliente
              </label>
              <select
                id="clienteId"
                required
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              >
                <option value="" disabled>
                  Selecione...
                </option>
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
                required
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={form.servicoId}
                onChange={(e) => setForm({ ...form, servicoId: e.target.value })}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} ({s.duracaoMinutos} min)
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
                required
                className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                value={form.profissionalId}
                onChange={(e) => setForm({ ...form, profissionalId: e.target.value })}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="data">
                  Data
                </label>
                <input
                  id="data"
                  type="date"
                  required
                  className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="hora">
                  Horário
                </label>
                <input
                  id="hora"
                  type="time"
                  required
                  className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                  value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })}
                />
              </div>
            </div>

            {agendamento && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full rounded border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as StatusAgendamento })
                  }
                >
                  {STATUS_OPCOES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-4 py-2 text-sm border border-black/15 dark:border-white/20"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="rounded bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
