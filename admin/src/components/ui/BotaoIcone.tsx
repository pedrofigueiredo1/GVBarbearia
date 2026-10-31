import type { ButtonHTMLAttributes } from 'react';
import { Icone, type NomeIcone } from './Icone';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icone: NomeIcone;
  // Texto da dica ao passar o mouse e do leitor de tela (não há texto visível).
  titulo: string;
  tom?: 'neutro' | 'cobre' | 'verde' | 'vermelho';
}

const TONS = {
  neutro: 'text-white/70 hover:bg-white/10 hover:text-foreground',
  cobre: 'text-copper hover:bg-copper/15',
  verde: 'text-emerald-400 hover:bg-emerald-400/15',
  vermelho: 'text-red-400 hover:bg-red-400/15',
};

// Botão só com ícone para as ações das tabelas (editar, excluir, cancelar...).
export function BotaoIcone({ icone, titulo, tom = 'neutro', className = '', ...resto }: Props) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-40 ${TONS[tom]} ${className}`}
      {...resto}
    >
      <Icone nome={icone} />
    </button>
  );
}
