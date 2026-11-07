// Foto pequena para as tabelas, no mesmo formato em pé (3:4) das fotos do app.
// Sem foto, mostra um espaço vazio do mesmo tamanho, para as linhas não
// ficarem desalinhadas.
export function MiniaturaFoto({ url, descricao }: { url: string | null; descricao: string }) {
  return (
    <div className="relative h-12 w-9 overflow-hidden rounded-md border border-borda bg-superficie-alta">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={descricao} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}
