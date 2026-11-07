// Testa o envio de foto de profissional e de produto: formato padrão 600x800,
// permissões, arquivos inválidos, troca, remoção e exclusão do dono.
const { execSync } = require('child_process');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => {
  if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); }
};
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();

async function json(metodo, caminho, corpo, token) {
  const res = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null };
}

async function enviar(caminho, buffer, tipo, token, nomeArquivo = 'foto.jpg') {
  const form = new FormData();
  form.append('foto', new Blob([buffer], { type: tipo }), nomeArquivo);
  const res = await fetch(`${API}${caminho}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null };
}

// Imagem de teste com o tamanho e formato pedidos.
const imagem = (largura, altura, formato = 'jpeg', fundo = { r: 200, g: 120, b: 40, alpha: 1 }) =>
  sharp({ create: { width: largura, height: altura, channels: 4, background: fundo } })[formato]().toBuffer();

async function dimensoes(caminho) {
  const res = await fetch(`${API}${caminho}`);
  const corpo = Buffer.from(await res.arrayBuffer());
  const meta = res.ok ? await sharp(corpo).metadata() : {};
  return { status: res.status, tipo: res.headers.get('content-type'), cache: res.headers.get('cache-control'), cors: res.headers.get('cross-origin-resource-policy'), largura: meta.width, altura: meta.height, formato: meta.format };
}

(async () => {
  sql(`DELETE FROM administradores WHERE login='qa-fotos@teste.com'`);
  sql(`DELETE FROM profissionais WHERE nome LIKE 'QA FOTO%'`);
  sql(`DELETE FROM produtos WHERE nome LIKE 'QA FOTO%'`);
  const hash = await bcrypt.hash('admin-fotos-1', 10);
  sql(`INSERT INTO administradores(nome,login,senha,\\"atualizadoEm\\") VALUES ('QA Fotos','qa-fotos@teste.com','${hash}',now())`);
  const token = (await json('POST', '/auth/login', { login: 'qa-fotos@teste.com', senha: 'admin-fotos-1' })).corpo?.accessToken;
  checar('login do admin de teste', !!token);

  try {
    const prof = (await json('POST', '/profissionais', { nome: 'QA FOTO Barbeiro', especialidade: 'Barbeiro', descricao: 'Teste de foto' }, token)).corpo;
    const prod = (await json('POST', '/produtos', { nome: 'QA FOTO Pomada', descricao: 'Teste de foto', preco: 10 }, token)).corpo;
    checar('profissional novo nasce sem foto', prof.fotoAtualizadaEm === null);
    checar('produto novo nasce sem foto', prod.fotoAtualizadaEm === null);
    checar('GET da foto inexistente dá 404', (await dimensoes(`/publico/profissionais/${prof.id}/foto`)).status === 404);

    // Permissões
    const pngPequeno = await imagem(100, 100, 'png');
    checar('envio sem login dá 401', (await enviar(`/profissionais/${prof.id}/foto`, pngPequeno, 'image/png', null)).status === 401);

    // Qualquer tamanho vira 600x800 JPEG
    const casos = [
      ['paisagem larga 2000x500 JPG', await imagem(2000, 500, 'jpeg'), 'image/jpeg'],
      ['retrato alto 300x1200 JPG', await imagem(300, 1200, 'jpeg'), 'image/jpeg'],
      ['quadrada pequena 100x100 PNG', pngPequeno, 'image/png'],
      ['WebP 900x700', await imagem(900, 700, 'webp'), 'image/webp'],
      ['PNG transparente 640x480', await imagem(640, 480, 'png', { r: 0, g: 0, b: 0, alpha: 0 }), 'image/png'],
    ];
    for (const [nome, buffer, tipo] of casos) {
      const r = await enviar(`/profissionais/${prof.id}/foto`, buffer, tipo, token);
      checar(`envio aceito: ${nome}`, r.status === 200 && !!r.corpo.fotoAtualizadaEm, JSON.stringify(r));
      const d = await dimensoes(`/publico/profissionais/${prof.id}/foto`);
      checar(`sai 600x800 JPEG: ${nome}`, d.largura === 600 && d.altura === 800 && d.formato === 'jpeg' && d.tipo === 'image/jpeg', JSON.stringify(d));
    }
    const d = await dimensoes(`/publico/profissionais/${prof.id}/foto`);
    checar('foto fica em cache longo', /max-age=31536000/.test(d.cache ?? ''), d.cache);
    checar('foto pode ser usada por outra origem (painel)', d.cors === 'cross-origin', String(d.cors));

    // A lista traz a data da foto, e não os bytes
    const lista = (await json('GET', '/profissionais', null, token)).corpo.find((p) => p.id === prof.id);
    checar('lista traz fotoAtualizadaEm preenchida', !!lista.fotoAtualizadaEm);
    checar('lista não traz o conteúdo da imagem', !('foto' in lista) && !JSON.stringify(lista).includes('conteudo'));

    // Produto também
    const rp = await enviar(`/produtos/${prod.id}/foto`, await imagem(1000, 1000, 'jpeg'), 'image/jpeg', token);
    checar('foto de produto aceita', rp.status === 200);
    const dp = await dimensoes(`/publico/produtos/${prod.id}/foto`);
    checar('foto de produto sai 600x800', dp.largura === 600 && dp.altura === 800, JSON.stringify(dp));

    // Arquivos inválidos
    checar('texto com tipo de imagem dá 400', (await enviar(`/profissionais/${prof.id}/foto`, Buffer.from('isto não é uma imagem'), 'image/png', token)).status === 400);
    checar('PDF dá 400', (await enviar(`/profissionais/${prof.id}/foto`, Buffer.from('%PDF-1.4'), 'application/pdf', token, 'a.pdf')).status === 400);
    checar('GIF dá 400', (await enviar(`/profissionais/${prof.id}/foto`, await imagem(50, 50, 'gif'), 'image/gif', token, 'a.gif')).status === 400);
    const grande = Buffer.alloc(9 * 1024 * 1024, 1);
    checar('arquivo acima de 8 MB dá 413', (await enviar(`/profissionais/${prof.id}/foto`, grande, 'image/jpeg', token)).status === 413);
    checar('sem arquivo dá 400', (await fetch(`${API}/profissionais/${prof.id}/foto`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: new FormData() })).status === 400);
    checar('profissional inexistente dá 404', (await enviar(`/profissionais/99999999/foto`, pngPequeno, 'image/png', token)).status === 404);
    checar('id inválido dá 400', (await enviar(`/profissionais/abc/foto`, pngPequeno, 'image/png', token)).status === 400);
    const aindaValida = await dimensoes(`/publico/profissionais/${prof.id}/foto`);
    checar('envios inválidos não estragam a foto atual', aindaValida.status === 200 && aindaValida.altura === 800);

    // Troca: só uma foto por profissional
    checar('uma única foto por profissional', Number(sql(`SELECT count(*) FROM fotos WHERE \\"profissionalId\\"=${prof.id}`)) === 1);

    // Remoção
    checar('remover sem login dá 401', (await json('DELETE', `/profissionais/${prof.id}/foto`, null, null)).status === 401);
    const rem = await json('DELETE', `/profissionais/${prof.id}/foto`, null, token);
    checar('remover foto', rem.status === 200 && rem.corpo.fotoAtualizadaEm === null);
    checar('depois de remover, GET dá 404', (await dimensoes(`/publico/profissionais/${prof.id}/foto`)).status === 404);
    checar('remover de novo não dá erro', (await json('DELETE', `/profissionais/${prof.id}/foto`, null, token)).status === 200);
    checar('lista volta a mostrar sem foto', (await json('GET', '/profissionais', null, token)).corpo.find((p) => p.id === prof.id).fotoAtualizadaEm === null);

    // Editar os dados não mexe na foto
    await enviar(`/produtos/${prod.id}/foto`, await imagem(700, 900, 'jpeg'), 'image/jpeg', token);
    await json('PATCH', `/produtos/${prod.id}`, { nome: 'QA FOTO Pomada 2' }, token);
    checar('editar o produto mantém a foto', (await dimensoes(`/publico/produtos/${prod.id}/foto`)).status === 200);

    // Excluir o dono leva a foto junto
    await json('DELETE', `/produtos/${prod.id}`, null, token);
    checar('excluir o produto apaga a foto do banco', Number(sql(`SELECT count(*) FROM fotos WHERE \\"produtoId\\"=${prod.id}`)) === 0);
  } finally {
    sql(`DELETE FROM profissionais WHERE nome LIKE 'QA FOTO%'`);
    sql(`DELETE FROM produtos WHERE nome LIKE 'QA FOTO%'`);
    sql(`DELETE FROM administradores WHERE login='qa-fotos@teste.com'`);
  }
  checar('sem fotos órfãs no fim', Number(sql(`SELECT count(*) FROM fotos WHERE \\"profissionalId\\" IS NULL AND \\"produtoId\\" IS NULL`)) === 0);
  console.log(`fotos: ${ok} ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})();
