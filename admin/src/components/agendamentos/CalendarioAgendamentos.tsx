'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api';
import { listarAgendamentos } from '@/lib/agendamentos';
import { encontrarBloqueio, listarBloqueios } from '@/lib/bloqueios';
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
import { estaAberto, partesFechadas, trechosDoQuadro } from '@/lib/horario-atendimento';
import { Botao } from '@/components/ui/Botao';
import { Icone } from '@/components/ui/Icone';
import { STATUS_LABEL, type Agendamento, type StatusAgendamento } from '@/types/agendamento';
import type { BloqueioAgenda } from '@/types/bloqueio';
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
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
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

  // Os bloqueios de agenda (feriados e ausências) aparecem sombreados no quadro.
  useEffect(() => {
    listarBloqueios()
      .then(setBloqueios)
      .catch(() => setBloqueios([]));
  }, [versao]);

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

  // O quadro mostra só as horas em que a barbearia está aberta (sem o almoço nem
  // as horas antes de abrir e depois de fechar). Agendamentos que já existiam fora
  // do expediente abrem o seu próprio trecho, para nenhum ficar escondido.
  const trechos = useMemo(() => {
    const dias = colunas.map((c) => dataDe(c.data).getDay());
    const foraDoExpediente = visiveis.map((a): [number, number] => {
      const d = new Date(a.dataHora);
      const comeco = d.getHours() * 60 + d.getMinutes();
      return [comeco, comeco + a.servico.duracaoMinutos];
    });
    return trechosDoQuadro(dias, foraDoExpediente.filter(([c]) => !dias.some((dia) => estaAberto(dia, c))));
  }, [colunas, visiveis]);

  // Posição vertical de cada trecho no quadro: um depois do outro, sem o espaço fechado entre eles.
  const deslocamentos = useMemo(() => {
    let soma = 0;
    return trechos.map(([ini, fim]) => {
      const topo = soma;
      soma += ((fim - ini) / 60) * PX_POR_HORA;
      return topo;
    });
  }, [trechos]);
  const alturaTotal = trechos.reduce((soma, [ini, fim]) => soma + ((fim - ini) / 60) * PX_POR_HORA, 0);

  // Minuto do dia -> posição (px) no quadro; um minuto fora dos trechos vai para o início do seguinte.
  function posicaoDe(minuto: number) {
    for (let i = 0; i < trechos.length; i++) {
      const [ini, fim] = trechos[i];
      if (minuto < ini) return deslocamentos[i];
      if (minuto <= fim) return deslocamentos[i] + ((minuto - ini) / 60) * PX_POR_HORA;
    }
    return alturaTotal;
  }

  // Posição (px) no quadro -> minuto do dia.
  function minutoDe(posicao: number) {
    for (let i = trechos.length - 1; i >= 0; i--) {
      if (posicao >= deslocamentos[i]) return trechos[i][0] + ((posicao - deslocamentos[i]) / PX_POR_HORA) * 60;
    }
    return trechos[0]?.[0] ?? 0;
  }

  const hoje = hojeLocal();

  function agendamentosDaColuna(coluna: ColunaCalendario) {
    return visiveis
      .filter((a) =>
        visao === 'dia'
          ? a.profissionalId === coluna.profissionalId
          : paraData(new Date(a.dataHora)) === coluna.data,
      )
      .map((a) => {
        const inicioData = new Date(a.dataHora);
        const inicio = inicioData.getHours() * 60 + inicioData.getMinutes();
        return { agendamento: a, inicio, fim: inicio + a.servico.duracaoMinutos };
      });
  }

  function clicarNoHorario(coluna: ColunaCalendario, clientY: number, topo: number) {
    // Dia que já passou ou agenda bloqueada: não abre novo agendamento.
    if (coluna.data < hoje || encontrarBloqueio(bloqueios, coluna.profissionalId, coluna.data)) return;
    const arredondado = Math.floor(minutoDe(clientY - topo) / 30) * 30;
    // Fora do expediente da barbearia (faixas hachuradas): não abre agendamento.
    if (!estaAberto(dataDe(coluna.data).getDay(), arredondado)) return;
    const hora = `${dois(Math.floor(arredondado / 60))}:${dois(arredondado % 60)}`;
    aoNovo({ profissionalId: coluna.profissionalId, dataHora: paraIsoLocal(coluna.data, hora) });
  }

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const agoraNoQuadro = trechos.some(([ini, fim]) => minutosAgora >= ini && minutosAgora <= fim);
  const passo = visao === 'dia' ? 1 : 7;

  const titulo =
    visao === 'dia'
      ? `${DIAS_SEMANA_LONGO[dataDe(data).getDay()]}, ${formatarDiaMes(data)}/${data.slice(0, 4)}`
      : `${formatarDiaMes(segunda)} a ${formatarDiaMes(somarDias(segunda, 5))}/${somarDias(segunda, 5).slice(0, 4)}`;


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
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-red-400/60 bg-red-950" />
            Agenda bloqueada
          </span>
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

            {trechos.length === 0 && colunas.length > 0 && (
              <div className="p-10 text-center text-sm text-white/50">A barbearia está fechada neste dia.</div>
            )}

            <div className={`flex ${carregando ? 'opacity-60 transition-opacity' : ''}`}>
              <div className="relative w-14 shrink-0" style={{ height: alturaTotal }}>
                {trechos.flatMap(([ini, fim], i) =>
                  Array.from({ length: (fim - ini) / 60 + 1 }, (_, k) => {
                    const minuto = ini + k * 60;
                    // No começo de um trecho o rótulo fica logo abaixo da linha, no fim logo acima.
                    const posicao = k === 0 ? 'translate-y-0.5' : minuto === fim ? '-translate-y-full' : '-translate-y-1/2';
                    return (
                      <span
                        key={`${i}-${minuto}`}
                        className={`absolute right-2 text-xs text-white/40 ${posicao}`}
                        style={{ top: deslocamentos[i] + k * PX_POR_HORA }}
                      >
                        {`${dois(minuto / 60)}:00`}
                      </span>
                    );
                  }),
                )}
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
                  const bloqueio = encontrarBloqueio(bloqueios, coluna.profissionalId, coluna.data);
                  const passado = coluna.data < hoje;
                  return (
                    <div
                      key={coluna.chave}
                      className={`relative border-l border-borda ${bloqueio || passado ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{
                        height: alturaTotal,
                        backgroundImage:
                          'linear-gradient(to bottom, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: `100% ${PX_POR_HORA}px, 100% ${PX_POR_HORA / 2}px`,
                      }}
                      onClick={(e) =>
                        clicarNoHorario(coluna, e.clientY, e.currentTarget.getBoundingClientRect().top)
                      }
                      title={
                        bloqueio
                          ? `Agenda bloqueada: ${bloqueio.motivo}`
                          : passado
                            ? 'Essa data já passou'
                            : 'Clique num horário livre para agendar (faixas hachuradas: barbearia fechada)'
                      }
                    >
                      {passado && !bloqueio && (
                        <div className="pointer-events-none absolute inset-0 bg-black/25" />
                      )}
                      {bloqueio && (
                        <div
                          className="pointer-events-none absolute inset-0 z-[4] flex items-start justify-center bg-red-950/50 px-2 pt-3"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(135deg, rgba(248,113,113,0.14) 0 8px, transparent 8px 16px)',
                          }}
                        >
                          <span className="rounded-md bg-red-950/90 px-2 py-1 text-center text-xs font-medium text-red-100">
                            Bloqueado: {bloqueio.motivo}
                          </span>
                        </div>
                      )}
                      {trechos.flatMap((trecho, i) =>
                        partesFechadas(dataDe(coluna.data).getDay(), trecho).map(([ini, fim]) => (
                          <div
                            key={`${i}-${ini}`}
                            className="pointer-events-none absolute inset-x-0"
                            style={{
                              top: posicaoDe(ini),
                              height: ((fim - ini) / 60) * PX_POR_HORA,
                              backgroundImage:
                                'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 12px)',
                            }}
                          />
                        )),
                      )}
                      {/* Divisória onde o quadro pula as horas fechadas (ex.: o almoço). */}
                      {deslocamentos.slice(1).map((topo) => (
                        <div
                          key={topo}
                          className="pointer-events-none absolute inset-x-0 border-t-2 border-white/20"
                          style={{ top: topo }}
                        />
                      ))}

                      {coluna.data === hoje && agoraNoQuadro && (
                        <div
                          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500"
                          style={{ top: posicaoDe(minutosAgora) }}
                        >
                          <span className="absolute -left-1 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                        </div>
                      )}

                      {itens.map(({ agendamento, inicio, fim, faixa, faixas }) => {
                        const altura = Math.max(22, ((fim - inicio) / 60) * PX_POR_HORA - 2);
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
                              top: posicaoDe(inicio) + 1,
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
