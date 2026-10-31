import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icone, type NomeIcone } from './Icone';

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma';
type Tamanho = 'normal' | 'pequeno';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  icone?: NomeIcone;
  carregando?: boolean;
  children: ReactNode;
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-copper text-copper-ink hover:brightness-110',
  secundario: 'border border-borda bg-superficie-alta text-foreground hover:bg-white/10',
  perigo: 'bg-red-600/90 text-white hover:bg-red-600',
  fantasma: 'text-white/70 hover:bg-white/10 hover:text-foreground',
};

const TAMANHOS: Record<Tamanho, string> = {
  normal: 'px-4 py-2 text-sm',
  pequeno: 'px-3 py-1.5 text-xs',
};

// Botão padrão do painel: variantes de cor, ícone opcional e estado de carregamento.
export function Botao({
  variante = 'primario',
  tamanho = 'normal',
  icone,
  carregando = false,
  disabled,
  className = '',
  children,
  ...resto
}: Props) {
  return (
    <button
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...resto}
    >
      {icone && <Icone nome={icone} tamanho={tamanho === 'pequeno' ? 14 : 16} />}
      {carregando ? 'Aguarde...' : children}
    </button>
  );
}
