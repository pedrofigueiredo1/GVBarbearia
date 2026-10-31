import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  // Texto pequeno ao lado do título (ex.: "últimos 30 dias").
  detalhe?: string;
  children: ReactNode;
}

// Caixa com título usada para agrupar um bloco do painel.
export function Secao({ titulo, detalhe, children }: Props) {
  return (
    <section className="rounded-xl border border-borda bg-superficie p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold">{titulo}</h3>
        {detalhe ? <span className="text-xs text-white/50">{detalhe}</span> : null}
      </div>
      {children}
    </section>
  );
}
