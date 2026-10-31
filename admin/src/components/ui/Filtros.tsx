import type { ReactNode, SelectHTMLAttributes } from 'react';
import { Botao } from './Botao';
import { Icone } from './Icone';

interface PropsBarra {
  busca: string;
  aoBuscar: (texto: string) => void;
  placeholderBusca: string;
  // Selects e campos de data de cada tela.
  children?: ReactNode;
  // Há busca ou filtro ligado? Mostra o botão "Limpar".
  ativos: boolean;
  aoLimpar: () => void;
}

// Barra acima das tabelas: campo de busca, os filtros da tela e "Limpar".
export function BarraDeFiltros({ busca, aoBuscar, placeholderBusca, children, ativos, aoLimpar }: PropsBarra) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <label className="relative min-w-60 flex-1">
        <span className="sr-only">Buscar</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          <Icone nome="buscar" />
        </span>
        <input
          type="search"
          value={busca}
          onChange={(e) => aoBuscar(e.target.value)}
          placeholder={placeholderBusca}
          className="w-full rounded-lg border border-borda bg-superficie py-2 pl-9 pr-3 text-sm"
        />
      </label>
      {children}
      {ativos && (
        <Botao variante="fantasma" tamanho="pequeno" icone="fechar" onClick={aoLimpar}>
          Limpar
        </Botao>
      )}
    </div>
  );
}

interface PropsCampo extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string;
}

// Select com rótulo pequeno em cima, para os filtros.
export function SelectFiltro({ rotulo, children, className = '', ...resto }: PropsCampo) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/60">
      {rotulo}
      <select
        className={`rounded-lg border border-borda bg-superficie px-3 py-2 text-sm text-foreground ${className}`}
        {...resto}
      >
        {children}
      </select>
    </label>
  );
}

// Campo de data com rótulo pequeno em cima, para filtros de período.
export function DataFiltro({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/60">
      {rotulo}
      <input
        type="date"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="rounded-lg border border-borda bg-superficie px-3 py-2 text-sm text-foreground"
      />
    </label>
  );
}
