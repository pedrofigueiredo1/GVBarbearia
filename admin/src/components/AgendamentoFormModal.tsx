'use client';

import { FormEvent, useEffect, useState } from 'react';
import { encontrarBloqueio, listarBloqueios } from '@/lib/bloqueios';
import { consultarHorariosDisponiveis } from '@/lib/agendamentos';
import { listarClientes } from '@/lib/clientes';
import { hojeLocal } from '@/lib/datas';
import { listarServicos } from '@/lib/servicos';
import { listarProfissionais } from '@/lib/profissionais';
import type { BloqueioAgenda } from '@/types/bloqueio';
import type { Cliente } from '@/types/cliente';
import type { Servico } from '@/types/servico';
import type { Profissional } from '@/types/profissional';
import type {
  Agendamento,
  CreateAgendamentoInput,
  HorarioDisponivel,
  StatusAgendamento,
  UpdateAgendamentoInput,
} from '@/types/agendamento';
import { STATUS_LABEL } from '@/types/agendamento';

interface Props {
  agendamento?: Agendamento | null;
  // Valores já preenchidos num agendamento novo (ex.: ao clicar num horário vazio do calendário).
  inicial?: { profissionalId?: number; dataHora?: string };
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
export function AgendamentoFormModal({ agendamento, inicial, onClose, onSalvar }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  // Horários livres do dia, dentro do expediente da barbearia (vêm da API).
  const [horarios, setHorarios] = useState<HorarioDisponivel[] | null>(null);
  const [diaFechado, setDiaFechado] = useState(false);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);

  const camposIniciais = agendamento
    ? paraCamposLocais(agendamento.dataHora)
    : inicial?.dataHora
      ? paraCamposLocais(inicial.dataHora)
      : { data: '', hora: '' };

  const [form, setForm] = useState({
    clienteId: agendamento?.clienteId ?? '',
    servicoId: agendamento?.servicoId ?? '',
    profissionalId: agendamento?.profissionalId ?? inicial?.profissionalId ?? '',
    data: camposIniciais.data,
    hora: camposIniciais.hora,
    status: agendamento?.status ?? 'CONFIRMADO',
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([listarClientes(), listarServicos(), listarProfissionais(), listarBloqueios()])
      .then(([c, s, p, b]) => {
        setClientes(c);
        setServicos(s);
        setProfissionais(p);
        setBloqueios(b);
      })
      .finally(() => setCarregandoOpcoes(false));
  }, []);

  // Só os horários em que a barbearia está aberta e o barbeiro está livre são
  // oferecidos. Depende do serviço (duração), do barbeiro, do dia e do cliente.
  const { servicoId, profissionalId, data, clienteId } = form;
  useEffect(() => {
    setHorarios(null);
    setDiaFechado(false);
    if (servicoId === '' || profissionalId === '' || data === '') return;

    let cancelado = false;
    setCarregandoHorarios(true);
    consultarHorariosDisponiveis({
      servicoId: Number(servicoId),
      profissionalId: Number(profissionalId),
      data,
      clienteId: clienteId === '' ? undefined : Number(clienteId),
      agendamentoId: agendamento?.id,
    })
      .then((resposta) => {
        if (cancelado) return;
        setHorarios(resposta.horarios);
        setDiaFechado(resposta.bloqueado);
      })
      .catch(() => {
        if (!cancelado) setHorarios([]);
      })
      .finally(() => {
        if (!cancelado) setCarregandoHorarios(false);
      });
    return () => {
      cancelado = true;
    };
  }, [servicoId, profissionalId, data, clienteId, agendamento?.id]);

  // Ao editar sem mudar serviço, barbeiro nem dia, o horário atual continua na lista
  // (mesmo que já tenha passado), para dar para mudar só o status.
  const mantemHorarioAtual =
    !!agendamento &&
    Number(servicoId) === agendamento.servicoId &&
    Number(profissionalId) === agendamento.profissionalId &&
    data === camposIniciais.data;
  const opcoesDeHora = (horarios ?? []).map((h) => h.hora);
  if (mantemHorarioAtual && camposIniciais.hora && !opcoesDeHora.includes(camposIniciais.hora)) {
    opcoesDeHora.unshift(camposIniciais.hora);
    opcoesDeHora.sort();
  }

  // Se o horário escolhido deixou de existir na lista (trocou o dia, o barbeiro ou o
  // serviço), a escolha é limpa para não enviar um horário fechado.
  useEffect(() => {
    if (horarios !== null && form.hora !== '' && !opcoesDeHora.includes(form.hora)) {
      setForm((atual) => ({ ...atual, hora: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horarios]);

  // Datas que já passaram não aceitam agendamento novo. Ao editar, só vale se o
  // dia foi trocado: um atendimento antigo continua podendo mudar de status.
  const mudouDia = !agendamento || form.data !== camposIniciais.data;
  const diaPassado = mudouDia && form.data !== '' && form.data < hojeLocal();

  // Agenda bloqueada (feriado ou ausência do barbeiro) no dia e barbeiro escolhidos.
  // Quem só cancela um agendamento que já existia no período pode seguir.
  const mudouAgenda =
    !agendamento ||
    mudouDia ||
    Number(form.profissionalId) !== agendamento.profissionalId;
  const bloqueio =
    mudouAgenda && form.status !== 'CANCELADO' && form.data && form.profissionalId !== ''
      ? encontrarBloqueio(bloqueios, Number(form.profissionalId), form.data)
      : undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    if (diaPassado) {
      setErro('Não é possível agendar em uma data que já passou.');
      return;
    }
    if (bloqueio) {
      setErro(`A agenda está bloqueada nessa data (${bloqueio.motivo}).`);
      return;
    }
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-superficie text-foreground rounded-xl shadow-xl w-full max-w-md p-6 border border-borda max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {agendamento ? 'Editar agendamento' : 'Novo agendamento'}
        </h3>

        {carregandoOpcoes ? (
          <p className="text-sm text-white/60">Carregando opções...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="clienteId">
                Cliente
              </label>
              <select
                id="clienteId"
                required
                className="w-full rounded-lg border border-borda bg-superficie-alta text-foreground px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-borda bg-superficie-alta text-foreground px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-borda bg-superficie-alta text-foreground px-3 py-2 text-sm"
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
                  min={agendamento ? undefined : hojeLocal()}
                  className="w-full rounded-lg border border-borda bg-superficie-alta px-3 py-2 text-sm"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="hora">
                  Horário
                </label>
                <select
                  id="hora"
                  required
                  disabled={horarios === null || carregandoHorarios || opcoesDeHora.length === 0}
                  className="w-full rounded-lg border border-borda bg-superficie-alta text-foreground px-3 py-2 text-sm disabled:opacity-60"
                  value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })}
                >
                  <option value="" disabled>
                    {carregandoHorarios ? 'Carregando...' : 'Selecione...'}
                  </option>
                  {opcoesDeHora.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {horarios === null && !carregandoHorarios && (
              <p className="-mt-2 text-xs text-white/50">
                Escolha o serviço, o barbeiro e a data para ver os horários livres.
              </p>
            )}
            {horarios !== null && opcoesDeHora.length === 0 && !diaFechado && !diaPassado && (
              <p className="-mt-2 text-xs text-amber-300">
                Não há horários livres nesse dia (a barbearia pode estar fechada). Escolha outra data.
              </p>
            )}
            {diaPassado && (
              <p className="text-sm text-red-500">Essa data já passou. Escolha hoje ou um dia futuro.</p>
            )}
            {bloqueio && (
              <p className="rounded-lg border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-200">
                A agenda está bloqueada nessa data
                {bloqueio.profissional ? ` para ${bloqueio.profissional.nome}` : ' para todos os barbeiros'}:{' '}
                {bloqueio.motivo}. Escolha outro dia ou outro barbeiro.
              </p>
            )}

            {agendamento && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full rounded-lg border border-borda bg-superficie-alta text-foreground px-3 py-2 text-sm"
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
                className="rounded-lg px-4 py-2 text-sm border border-borda"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || diaPassado || !!bloqueio}
                className="rounded-lg bg-copper text-copper-ink hover:brightness-110 px-4 py-2 text-sm font-medium disabled:opacity-50"
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
