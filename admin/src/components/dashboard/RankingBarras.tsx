import { formatarMoeda } from '@/lib/formatar';
import type { ItemDeRanking } from '@/types/dashboard';

// Lista de barras horizontais (serviço ou barbeiro) em ordem de atendimentos.
export function RankingBarras({ itens, vazio }: { itens: ItemDeRanking[]; vazio: string }) {
  if (itens.length === 0) {
    return <p className="text-sm text-white/50">{vazio}</p>;
  }

  const maximo = Math.max(...itens.map((i) => i.atendimentos));
  return (
    <ul className="flex flex-col gap-3">
      {itens.map((item) => (
        <li key={item.nome}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{item.nome}</span>
            <span className="shrink-0 text-white/60">
              {item.atendimentos} · {formatarMoeda(item.faturamento)}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-copper"
              style={{ width: `${(item.atendimentos / maximo) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
