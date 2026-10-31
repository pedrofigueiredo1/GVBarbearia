import { formatarMoeda } from '@/lib/formatar';
import type { PeriodoComComparacao } from '@/types/dashboard';

interface Props {
  titulo: string;
  comparadoCom: string;
  periodo: PeriodoComComparacao;
}

// Mostra a variação contra o período anterior: seta, percentual e o valor de
// antes. Sem nada no período anterior, um aumento aparece como "novo".
function Variacao({ atual, anterior, comparadoCom }: { atual: number; anterior: number; comparadoCom: string }) {
  if (atual === anterior) {
    return (
      <p className="text-xs text-white/50">
        = igual {comparadoCom} ({anterior})
      </p>
    );
  }

  const subiu = atual > anterior;
  const percentual = anterior === 0 ? null : Math.round((Math.abs(atual - anterior) / anterior) * 100);
  return (
    <p className={`text-xs font-medium ${subiu ? 'text-emerald-400' : 'text-red-400'}`}>
      {subiu ? '▲' : '▼'} {percentual === null ? 'novo' : `${percentual}%`}{' '}
      <span className="font-normal text-white/50">
        {comparadoCom} ({anterior})
      </span>
    </p>
  );
}

// Cartão do dashboard com a passagem de clientes (atendimentos concluídos) de
// um período, o faturamento estimado e a comparação com o período anterior.
export function CartaoPeriodo({ titulo, comparadoCom, periodo }: Props) {
  return (
    <div className="rounded-xl border border-borda bg-superficie p-4 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wider text-white/60">{titulo}</p>
      <p className="text-4xl font-semibold text-copper">{periodo.atendimentos}</p>
      <p className="text-sm text-white/70">
        {periodo.atendimentos === 1 ? 'cliente atendido' : 'clientes atendidos'}
      </p>
      <p className="text-sm text-white/70">{formatarMoeda(periodo.faturamento)}</p>
      <div className="mt-1">
        <Variacao
          atual={periodo.atendimentos}
          anterior={periodo.anterior.atendimentos}
          comparadoCom={comparadoCom}
        />
      </div>
    </div>
  );
}
