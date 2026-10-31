import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  subtitulo?: string;
  // Botões à direita (ex.: "+ Novo cliente").
  children?: ReactNode;
}

// Título de cada tela do painel, com os botões de ação à direita.
export function CabecalhoPagina({ titulo, subtitulo, children }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold">{titulo}</h2>
        {subtitulo ? <p className="text-sm text-white/60">{subtitulo}</p> : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
