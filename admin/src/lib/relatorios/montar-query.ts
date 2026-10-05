// Monta a query string ignorando filtros vazios/indefinidos, para que o
// backend receba só o que o administrador de fato preencheu.
export function montarQuery(filtros: object) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(chave, String(valor));
  }
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}
