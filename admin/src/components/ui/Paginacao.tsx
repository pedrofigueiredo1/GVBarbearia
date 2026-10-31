import { Icone } from './Icone';

interface Props {
  pagina: number;
  total: number;
  tamanho: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarTamanho: (tamanho: number) => void;
  tamanhos?: number[];
}

// Números das páginas com reticências: 1 … 4 5 [6] 7 8 … 20.
function paginasVisiveis(atual: number, ultima: number): (number | '…')[] {
  const nomes = new Set([1, ultima, atual - 1, atual, atual + 1].filter((n) => n >= 1 && n <= ultima));
  const ordenadas = [...nomes].sort((a, b) => a - b);
  const resultado: (number | '…')[] = [];
  ordenadas.forEach((n, i) => {
    if (i > 0 && n - ordenadas[i - 1] > 1) resultado.push('…');
    resultado.push(n);
  });
  return resultado;
}

// Rodapé das tabelas: quantos registros aparecem, escolha de quantos por página
// e navegação. Com poucos registros, mostra só a contagem.
export function Paginacao({
  pagina,
  total,
  tamanho,
  aoMudarPagina,
  aoMudarTamanho,
  tamanhos = [10, 25, 50],
}: Props) {
  const ultima = Math.max(1, Math.ceil(total / tamanho));
  const primeiroItem = total === 0 ? 0 : (pagina - 1) * tamanho + 1;
  const ultimoItem = Math.min(total, pagina * tamanho);
  const precisaPaginar = total > tamanhos[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borda px-4 py-3 text-sm">
      <span className="text-white/60">
        {total === 0 ? 'Nenhum registro' : `Mostrando ${primeiroItem}–${ultimoItem} de ${total}`}
      </span>

      {precisaPaginar && (
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-white/60">
            Por página
            <select
              value={tamanho}
              onChange={(e) => aoMudarTamanho(Number(e.target.value))}
              className="rounded-lg border border-borda bg-superficie-alta px-2 py-1 text-foreground"
            >
              {tamanhos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <nav className="flex items-center gap-1" aria-label="Paginação">
            <button
              onClick={() => aoMudarPagina(pagina - 1)}
              disabled={pagina <= 1}
              aria-label="Página anterior"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30"
            >
              <Icone nome="esquerda" />
            </button>
            {paginasVisiveis(pagina, ultima).map((n, i) =>
              n === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-white/40">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => aoMudarPagina(n)}
                  aria-current={n === pagina ? 'page' : undefined}
                  className={`h-8 min-w-8 rounded-lg px-2 text-sm ${
                    n === pagina ? 'bg-copper font-semibold text-copper-ink' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              onClick={() => aoMudarPagina(pagina + 1)}
              disabled={pagina >= ultima}
              aria-label="Próxima página"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30"
            >
              <Icone nome="direita" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
