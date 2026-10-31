'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api';
import { listarAgendamentos } from '@/lib/agendamentos';
import { listarProfissionais } from '@/lib/profissionais';
import {
  DIAS_SEMANA_CURTO,
  DIAS_SEMANA_LONGO,
  dataDe,
  formatarDiaMes,
  hojeLocal,
  limitesDosDias,
  paraData,
  paraIsoLocal,
  segundaDaSemana,
  somarDias,
} from '@/lib/datas';
import { HORA_FINAL, HORA_INICIAL, trechosFechados } from '@/lib/horario-atendimento';
import { Botao } from '@/components/ui/Botao';
import { Icone } from '@/components/ui/Icone';
import { STATUS_LABEL, type Agendamento, type StatusAgendamento } from '@/types/agendamento';
import type { Profissional } from '@/types/profissional';

const PX_POR_HORA = 64;

interface Props {
  // Muda quando algo foi salvo/cancelado fora do calendário, para recarregar.
  versao: number;
  // Clique num horário vazio: novo agendamento já preenchido.
  aoNovo: (inicial: { profissionalId: number; dataHora: string }) => void;
  // Clique num agendamento.
  aoAbrir: (agendamento: Agendamento) => void;
}

interface ColunaCalendario {
  chave: string;
  titulo: string;
  subtitulo?: string;
  data: string; // AAAA-MM-DD
  profissionalId: number;
}

const ESTILO_BLOCO: Record<StatusAgendamento, string> = {
  PENDENTE: 'border-amber-400 bg-amber-400/20 text-amber-50',
  CONFIRMADO: 'border-sky-400 bg-sky-400/20 text-sky-50',
  CONCLUIDO: 'border-emerald-400 bg-emerald-400/20 text-emerald-50',
  CANCELADO: 'border-red-400/70 bg-red-400/10 text-red-100/70 line-through',
};

const PONTO_LEGENDA: Record<StatusAgendamento, string> = {
  PENDENTE: 'bg-amber-400',
  CONFIRMADO: 'bg-sky-400',
  CONCLUIDO: 'bg-emerald-400',
  CANCELADO: 'bg-red-400',
};

const dois = (n: number) => String(n).padStart(2, '0');

// Distribui agendamentos que se sobrepõem lado a lado dentro da coluna.
function distribuir(itens: { inicio: number; fim: number; agendamento: Agendamento }[]) {
  const ordenados = [...itens].sort((a, b) => a.inicio - b.inicio || a.fim - b.fim);
  const resultado: { agendamento: Agendamento; inicio: number; fim: number; faixa: number; faixas: number }[] = [];

  let grupo: typeof resultado = [];
  let fimDoGrupo = -1;
  let fimsDasFaixas: number[] = [];

  const fecharGrupo = () => {
    grupo.forEach((item) => (item.faixas = fimsDasFaixas.length));
    resultado.push(...grupo);
    grupo = [];
    fimsDasFaixas = [];
    fimDoGrupo = -1;
  };

  for (const item of ordenados) {
    if (item.inicio >= fimDoGrupo && grupo.length > 0) fecharGrupo();

    let faixa = fimsDasFaixas.findIndex((fim) => fim <= item.inicio);
    if (faixa === -1) {
      faixa = fimsDasFaixas.length;
      fimsDasFaixas.push(item.fim);
    } else {
      fimsDasFaixas[faixa] = item.fim;
    }
    grupo.push({ ...item, faixa, faixas: 1 });
    fimDoGrupo = Math.max(fimDoGrupo, item.fim);
  }
  if (grupo.length > 0) fecharGrupo();
  return resultado;
}

// Calendário dos agendamentos: visão do DIA (uma coluna por barbeiro) e da
// SEMANA (um barbeiro por vez, uma coluna por dia). Cada agendamento é um bloco
// do tamanho da duração do serviço; clicar nele abre os detalhes e clicar num
// horário vazio abre um novo agendamento.
export function CalendarioAgendamentos({ versao, aoNovo, aoAbrir }: Props) {
  const [visao, setVisao] = useState<'dia' | 'semana'>('dia');
  const [data, setData] = useState(hojeLocal());
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [profissionalId, setProfissionalId] = useState<number | null>(null);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => new Date());

  // A linha do "agora" anda a cada minuto.
  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(relogio);
  }, []);

  useEffect(() => {
    listarProfissionais()
      .then((lista) => {
        setProfissionais(lista);
        setProfissionalId((atual) => atual ?? lista[0]?.id ?? null);
      })
      .catch(() => setErro('Não foi possível carregar os profissionais.'));
  }, []);

  const segunda = segundaDaSemana(data);
  const inicioPeriodo = visao === 'dia' ? data : segunda;
  const fimPeriodo = visao === 'dia' ? somarDias(data, 1) : somarDias(segunda, 7);

  const [recarga, setRecarga] = useState(0);
  useEffect(() => {
    if (visao === 'semana' && profissionalId === null) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    const { dataInicio, dataFim } = limitesDosDias(inicioPeriodo, fimPeriodo);
    listarAgendamentos({
      dataInicio,
      dataFim,
      ...(visao === 'semana' && profissionalId !== null && { profissionalId }),
    })
      .then((lista) => {
        if (!cancelado) setAgendamentos(lista);
      })
      .catch((err) => {
        if (!cancelado)
          setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar os agendamentos.');
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [visao, inicioPeriodo, fimPeriodo, profissionalId, versao, recarga]);

  const colunas: ColunaCalendario[] = useMemo(() => {
    if (visao === 'dia') {
      return profissionais.map((p) => ({
        chave: `p-${p.id}`,
        titulo: p.nome,
        subtitulo: p.especialidade,
        data,
        profissionalId: p.id,
      }));
    }
    // Segunda a sábado; o domingo (barbearia fechada) só aparece se alguém
    // tiver agendamento nele, para nenhum agendamento ficar escondido.
    const domingo = somarDias(segunda, 6);
    const temDomingo = agendamentos.some((a) => paraData(new Date(a.dataHora)) === domingo);
    return Array.from({ length: temDomingo ? 7 : 6 }, (_, i) => {
      const dia = somarDias(segunda, i);
      return {
        chave: dia,
        titulo: DIAS_SEMANA_CURTO[(i + 1) % 7],
        subtitulo: formatarDiaMes(dia),
        data: dia,
        profissionalId: profissionalId ?? 0,
      };
    });
  }, [visao, profissionais, data, segunda, profissionalId, agendamentos]);

  const visiveis = useMemo(
    () => agendamentos.filter((a) => mostrarCancelados || a.status !== 'CANCELADO'),
    [agendamentos, mostrarCancelados],
  );

  // O quadro mostra das 8h às 21h e cresce quando há agendamento fora dessa
  // faixa (ex.: um horário às 22h marcado pela recepção), para nenhum ficar
  // escondido.
  const { horaInicial, horaFinal } = useMemo(() => {
    let inicio = HORA_INICIAL;
    let fim = HORA_FINAL;
    for (const a of visiveis) {
      const d = new Date(a.dataHora);
      const comeco = d.getHours() * 60 + d.getMinutes();
      inicio = Math.min(inicio, Math.floor(comeco / 60));
      fim = Math.max(fim, Math.ceil((comeco + a.servico.duracaoMinutos) / 60));
    }
    return { horaInicial: Math.max(0, inicio), horaFinal: Math.min(24, fim) };
  }, [visiveis]);
  const minutosIniciais = horaInicial * 60;
  const alturaTotal = (horaFinal - horaInicial) * PX_POR_HORA;

  function agendamentosDaColuna(coluna: ColunaCalendario) {
    return visiveis
      .filter((a) =>
        visao === 'dia'
          ? a.profissionalId === coluna.profissionalId
          : paraData(new Date(a.dataHora)) === coluna.data,
      )
      .map((a) => {
        const inicioData = new Date(a.dataHora);
        const inicio = inicioData.getHours() * 60 + inicioData.getMinutes() - minutosIniciais;
        return { agendamento: a, inicio, fim: inicio + a.servico.duracaoMinutos };
      });
  }

  function clicarNoHorario(coluna: ColunaCalendario, clientY: number, topo: number) {
    const minutosDesdeInicio = ((clientY - topo) / PX_POR_HORA) * 60;
    const arredondado = Math.floor(minutosDesdeInicio / 30) * 30 + minutosIniciais;
    const hora = `${dois(Math.floor(arredondado / 60))}:${dois(arredondado % 60)}`;
    aoNovo({ profissionalId: coluna.profissionalId, dataHora: paraIsoLocal(coluna.data, hora) });
  }

  const hoje = hojeLocal();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes() - minutosIniciais;
  const passo = visao === 'dia' ? 1 : 7;

  const titulo =
    visao === 'dia'
      ? `${DIAS_SEMANA_LONGO[dataDe(data).getDay()]}, ${formatarDiaMes(data)}/${data.slice(0, 4)}`
      : `${formatarDiaMes(segunda)} a ${formatarDiaMes(somarDias(segunda, 5))}/${somarDias(segunda, 5).slice(0, 4)}`;

  const horas = Array.from({ length: horaFinal - horaInicial + 1 }, (_, i) => horaInicial + i);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            aria-label={visao === 'dia' ? 'Dia anterior' : 'Semana anterior'}
            onClick={() => setData(somarDias(data, -passo))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-borda bg-superficie hover:bg-white/10"
          >
            <Icone nome="esquerda" />
          </button>
          <button
            aria-label={visao === 'dia' ? 'Próximo dia' : 'Próxima semana'}
            onClick={() => setData(somarDias(data, passo))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-borda bg-superficie hover:bg-white/10"
          >
            <Icone nome="direita" />
          </button>
          <Botao variante="secundario" onClick={() => setData(hoje)}>
            Hoje
          </Botao>
          <input
            type="date"
            aria-label="Ir para a data"
            value={data}
            onChange={(e) => e.target.value && setData(e.target.value)}
            className="rounded-lg border border-borda bg-superficie px-3 py-2 text-sm"
          />
          <h3 className="ml-2 text-lg font-semibold">{titulo}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {visao === 'semana' && (
            <select
              aria-label="Barbeiro"
              value={profissionalId ?? ''}
              onChange={(e) => setProfissionalId(Number(e.target.value))}
              className="rounded-lg border border-borda bg-superficie px-3 py-2 text-sm"
            >
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          )}
          <div className="inline-flex rounded-lg border border-borda bg-superficie p-0.5 text-sm">
            {(['dia', 'semana'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisao(v)}
                aria-pressed={visao === v}
                className={`rounded-md px-3 py-1.5 ${
                  visao === v ? 'bg-copper font-medium text-copper-ink' : 'text-white/70 hover:text-foreground'
                }`}
              >
                {v === 'dia' ? 'Dia' : 'Semana'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex flex-wrap items-center gap-4">
          {(Object.keys(STATUS_LABEL) as StatusAgendamento[])
            .filter((s) => mostrarCancelados || s !== 'CANCELADO')
            .map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${PONTO_LEGENDA[s]}`} />
                {STATUS_LABEL[s]}
              </span>
            ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={mostrarCancelados}
            onChange={(e) => setMostrarCancelados(e.target.checked)}
          />
          Mostrar cancelados
        </label>
      </div>

      {erro && (
        <div className="rounded-lg border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-200">
          {erro}{' '}
          <button className="underline" onClick={() => setRecarga((r) => r + 1)}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-borda bg-superficie">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 80 + colunas.length * 150 }}>
            <div className="flex border-b border-borda">
              <div className="w-14 shrink-0" />
              <div
                className="grid flex-1"
                style={{ gridTemplateColumns: `repeat(${Math.max(colunas.length, 1)}, minmax(0, 1fr))` }}
              >
                {colunas.map((coluna) => (
                  <div
                    key={coluna.chave}
                    className={`border-l border-borda px-3 py-2 text-center ${
                      coluna.data === hoje && visao === 'semana' ? 'bg-copper/10' : ''
                    }`}
                  >
                    <p className="truncate text-sm font-semibold">{coluna.titulo}</p>
                    {coluna.subtitulo && <p className="truncate text-xs text-white/50">{coluna.subtitulo}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex ${carregando ? 'opacity-60 transition-opacity' : ''}`}>
              <div className="relative w-14 shrink-0" style={{ height: alturaTotal }}>
                {horas.map((h, i) => (
                  <span
                    key={h}
                    className="absolute right-2 -translate-y-1/2 text-xs text-white/40"
                    style={{ top: i * PX_POR_HORA }}
                  >
                    {i === 0 ? '' : `${dois(h)}:00`}
                  </span>
                ))}
              </div>

              <div
                className="grid flex-1"
                style={{ gridTemplateColumns: `repeat(${Math.max(colunas.length, 1)}, minmax(0, 1fr))` }}
              >
                {colunas.length === 0 && (
                  <div className="p-8 text-center text-sm text-white/50">Nenhum profissional cadastrado.</div>
                )}
                {colunas.map((coluna) => {
                  const itens = distribuir(agendamentosDaColuna(coluna));
                  return (
                    <div
                      key={coluna.chave}
                      className="relative cursor-pointer border-l border-borda"
                      style={{
                        height: alturaTotal,
                        backgroundImage:
                          'linear-gradient(to bottom, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: `100% ${PX_POR_HORA}px, 100% ${PX_POR_HORA / 2}px`,
                      }}
                      onClick={(e) =>
                        clicarNoHorario(coluna, e.clientY, e.currentTarget.getBoundingClientRect().top)
                      }
                      title="Clique num horário livre para agendar"
                    >
                      {trechosFechados(dataDe(coluna.data).getDay(), horaInicial, horaFinal).map(([ini, fim]) => (
                        <div
                          key={`${ini}-${fim}`}
                          className="pointer-events-none absolute inset-x-0"
                          style={{
                            top: ((ini - minutosIniciais) / 60) * PX_POR_HORA,
                            height: ((fim - ini) / 60) * PX_POR_HORA,
                            backgroundImage:
                              'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 12px)',
                          }}
                        />
                      ))}

                      {coluna.data === hoje && minutosAgora >= 0 && minutosAgora <= alturaTotal / PX_POR_HORA * 60 && (
                        <div
                          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500"
                          style={{ top: (minutosAgora / 60) * PX_POR_HORA }}
                        >
                          <span className="absolute -left-1 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                        </div>
                      )}

                      {itens.map(({ agendamento, inicio, fim, faixa, faixas }) => {
                        const topo = Math.max(0, inicio);
                        const base = Math.min(alturaTotal / PX_POR_HORA * 60, fim);
                        const altura = Math.max(22, ((base - topo) / 60) * PX_POR_HORA - 2);
                        return (
                          <button
                            key={agendamento.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              aoAbrir(agendamento);
                            }}
                            title={`${agendamento.cliente.nome} · ${agendamento.servico.nome} · ${STATUS_LABEL[agendamento.status]}`}
                            className={`absolute z-[5] overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-left text-xs leading-tight shadow-sm hover:brightness-125 ${ESTILO_BLOCO[agendamento.status]}`}
                            style={{
                              top: (topo / 60) * PX_POR_HORA + 1,
                              height: altura,
                              left: `calc(${(faixa / faixas) * 100}% + 2px)`,
                              width: `calc(${100 / faixas}% - 4px)`,
                            }}
                          >
                            <span className="block truncate font-semibold">
                              {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              {agendamento.cliente.nome}
                            </span>
                            {altura >= 40 && (
                              <span className="block truncate opacity-80">{agendamento.servico.nome}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
