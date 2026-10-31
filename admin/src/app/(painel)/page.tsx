'use client';

import { useCallback, useEffect, useState } from 'react';
import { AgendaDeHoje } from '@/components/dashboard/AgendaDeHoje';
import { CartaoPeriodo } from '@/components/dashboard/CartaoPeriodo';
import { ListaPendentes } from '@/components/dashboard/ListaPendentes';
import { RankingBarras } from '@/components/dashboard/RankingBarras';
import { Botao } from '@/components/ui/Botao';
import { Secao } from '@/components/ui/Secao';
import { ApiError } from '@/lib/api';
import { consultarDashboard } from '@/lib/dashboard';
import { formatarMoeda } from '@/lib/formatar';
import type { Dashboard } from '@/types/dashboard';

function Indicador({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-lg border border-borda bg-background/40 p-3">
      <p className="text-xs text-white/60">{titulo}</p>
      <p className="text-xl font-semibold">{valor}</p>
      {detalhe ? <p className="text-xs text-white/50">{detalhe}</p> : null}
    </div>
  );
}

// Tela inicial do painel (é para onde o login leva): o fluxo da barbearia de
// relance. A "passagem de clientes" conta os atendimentos concluídos de cada
// período, comparados com o período anterior; embaixo ficam o que precisa de
// ação (pendentes), a agenda de hoje e os números dos últimos 30 dias.
export default function DashboardPage() {
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await consultarDashboard());
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar o dashboard.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const dataDeHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const ind = dados?.indicadores;
  const mes30 = dados?.passagem.ultimos30Dias;
  const ticketMedio = mes30 && mes30.atendimentos > 0 ? mes30.faturamento / mes30.atendimentos : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-white/60 first-letter:uppercase">{dataDeHoje}</p>
        </div>
        <Botao variante="secundario" onClick={carregar} carregando={carregando}>
          Atualizar
        </Botao>
      </div>

      {erro && (
        <p className="rounded-lg border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-200">
          {erro}
        </p>
      )}
      {carregando && !dados && <p className="text-sm text-white/60">Carregando...</p>}

      {dados && ind && (
        <>
          <section>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/60">
              Passagem de clientes
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              <CartaoPeriodo titulo="Hoje" comparadoCom="vs ontem" periodo={dados.passagem.hoje} />
              <CartaoPeriodo titulo="Ontem" comparadoCom="vs anteontem" periodo={dados.passagem.ontem} />
              <CartaoPeriodo
                titulo="Últimos 7 dias"
                comparadoCom="vs 7 dias antes"
                periodo={dados.passagem.ultimos7Dias}
              />
              <CartaoPeriodo
                titulo="Últimos 30 dias"
                comparadoCom="vs 30 dias antes"
                periodo={dados.passagem.ultimos30Dias}
              />
              <CartaoPeriodo
                titulo="Mês atual"
                comparadoCom="vs mês anterior"
                periodo={dados.passagem.mesAtual}
              />
            </div>
          </section>

          <Secao titulo="Resumo" detalhe="últimos 30 dias">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <Indicador titulo="Faturamento" valor={formatarMoeda(mes30?.faturamento ?? 0)} />
              <Indicador titulo="Ticket médio" valor={formatarMoeda(ticketMedio)} />
              <Indicador
                titulo="Cancelamentos"
                valor={`${ind.agendamentos.taxaCancelamento.toLocaleString('pt-BR')}%`}
                detalhe={`${ind.agendamentos.cancelados} de ${ind.agendamentos.total}`}
              />
              <Indicador titulo="Novos clientes" valor={String(ind.clientes.novos)} />
              <Indicador
                titulo="Clientes frequentes"
                valor={String(ind.clientes.frequentes)}
                detalhe="5+ atendimentos"
              />
              <Indicador
                titulo="Nota média"
                valor={
                  ind.avaliacoes.mediaGeral === null
                    ? '—'
                    : `${ind.avaliacoes.mediaGeral.toLocaleString('pt-BR')} ★`
                }
                detalhe={`${ind.avaliacoes.totalGeral} ${ind.avaliacoes.totalGeral === 1 ? 'avaliação' : 'avaliações'}`}
              />
            </div>
          </Secao>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Secao
              titulo="Aguardando confirmação"
              detalhe={dados.pendentesTotal > 0 ? `${dados.pendentesTotal} pendente(s)` : undefined}
            >
              <ListaPendentes
                pendentes={dados.pendentes}
                total={dados.pendentesTotal}
                aoConfirmar={carregar}
              />
            </Secao>
            <Secao titulo="Agenda de hoje" detalhe={`${dados.agendaHoje.length} agendamento(s)`}>
              <AgendaDeHoje agenda={dados.agendaHoje} />
            </Secao>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Secao titulo="Serviços mais atendidos" detalhe="últimos 30 dias">
              <RankingBarras itens={ind.topServicos} vazio="Nenhum atendimento concluído no período." />
            </Secao>
            <Secao titulo="Atendimentos por barbeiro" detalhe="últimos 30 dias">
              <RankingBarras
                itens={ind.porProfissional}
                vazio="Nenhum atendimento concluído no período."
              />
            </Secao>
          </div>
        </>
      )}
    </div>
  );
}
