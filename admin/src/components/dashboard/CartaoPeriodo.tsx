import { formatarMoeda } from '@/lib/formatar';
import type { Totais } from '@/types/dashboard';

interface Props {
  titulo: string;
  periodo: Totais;
}

// Cartão do dashboard com a passagem de clientes (atendimentos concluídos) de
// um período e o faturamento estimado.
export function CartaoPeriodo({ titulo, periodo }: Props) {
  return (
    <div className="rounded-xl border border-borda bg-superficie p-4 flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wider text-white/60">{titulo}</p>
      <p className="text-4xl font-semibold text-copper">{periodo.atendimentos}</p>
      <p className="text-sm text-white/70">
        {periodo.atendimentos === 1 ? 'cliente atendido' : 'clientes atendidos'}
      </p>
      <p className="text-sm text-white/70">{formatarMoeda(periodo.faturamento)}</p>
    </div>
  );
}
