// Limite de tentativas por IP (precisa do backend SEM DESATIVAR_LIMITE_DE_REQUISICOES).
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); } };
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();
async function post(caminho, corpo) {
  const res = await fetch(`${API}${caminho}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null, retry: res.headers.get('retry-after') };
}
(async () => {
  sql(`DELETE FROM clientes WHERE email LIKE 'qa-lim%@teste.com'`);

  console.log('1) login do administrador: 5 por minuto');
  const respostas = [];
  for (let i = 0; i < 7; i++) respostas.push(await post('/auth/login', { login: process.env.ADMIN_LOGIN, senha: 'errada' + i }));
  checar('as 5 primeiras tentativas passam (401)', respostas.slice(0, 5).every((r) => r.status === 401), respostas.map((r) => r.status).join(','));
  checar('a 6ª e a 7ª são barradas (429)', respostas[5].status === 429 && respostas[6].status === 429, respostas.map((r) => r.status).join(','));
  checar('mensagem em português', /Muitas tentativas/.test(respostas[5].corpo.message), JSON.stringify(respostas[5].corpo));
  checar('informa quando tentar de novo (Retry-After)', !!respostas[5].retry);
  const certa = await post('/auth/login', { login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA });
  checar('mesmo com a senha certa, bloqueado durante o minuto', certa.status === 429);

  console.log('2) login do cliente: 5 por minuto');
  const rc = [];
  for (let i = 0; i < 6; i++) rc.push(await post('/auth/cliente/login', { email: 'qa-limite@teste.com', senha: 'errada' + i }));
  checar('5 passam e a 6ª é barrada', rc.slice(0, 5).every((r) => r.status === 401) && rc[5].status === 429, rc.map((r) => r.status).join(','));

  console.log('3) recuperação de senha: 3 pedidos por 15 minutos');
  const re = [];
  for (let i = 0; i < 4; i++) re.push(await post('/auth/cliente/esqueci-senha', { email: `qa-lim${i}@teste.com` }));
  checar('3 passam e o 4º é barrado', re.slice(0, 3).every((r) => r.status === 200) && re[3].status === 429, re.map((r) => r.status).join(','));
  const ra = [];
  for (let i = 0; i < 4; i++) ra.push(await post('/auth/esqueci-senha', { login: `qa-lim${i}@teste.com` }));
  checar('painel: 3 passam e o 4º é barrado', ra.slice(0, 3).every((r) => r.status === 200) && ra[3].status === 429, ra.map((r) => r.status).join(','));

  console.log('4) cadastro público: 10 por hora');
  const rs = [];
  for (let i = 0; i < 12; i++) rs.push(await post('/publico/clientes', { nome: `QA Lim ${i}`, email: `qa-lim-s${i}@teste.com`, telefone: '44900000000', senha: '123456' }));
  checar('10 passam e as seguintes são barradas', rs.slice(0, 10).every((r) => r.status === 201) && rs.slice(10).every((r) => r.status === 429), rs.map((r) => r.status).join(','));

  console.log('5) uso normal não é afetado');
  let normal = 0;
  for (let i = 0; i < 30; i++) { const r = await fetch(`${API}/publico/servicos`); if (r.status === 200) normal++; }
  checar('30 consultas públicas seguidas funcionam', normal === 30, `${normal}/30`);

  sql(`DELETE FROM clientes WHERE email LIKE 'qa-lim%@teste.com'`);
  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); process.exit(1); });
