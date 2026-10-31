// Recuperação de senha por e-mail (Brevo) contra o servidor falso da Brevo.
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
const MOCK = 'http://127.0.0.1:4010';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); } };
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(metodo, caminho, corpo, token) {
  const res = await fetch(`${API}${caminho}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null };
}
const mock = async (caminho, corpo) => (await fetch(`${MOCK}${caminho}`, { method: corpo ? 'POST' : 'GET', body: corpo ? JSON.stringify(corpo) : undefined })).text();
const recebidos = async () => JSON.parse(await mock('/__recebidos'));

function limpar() {
  sql(`DELETE FROM clientes WHERE email LIKE 'qa-mail%@teste.com'`);
  sql(`DELETE FROM administradores WHERE login LIKE 'qa-mail%'`);
}

(async () => {
  limpar();
  await mock('/__limpar', {});
  await mock('/__modo', { status: 201 });
  const login = await req('POST', '/auth/login', { login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA });
  const A = login.corpo.accessToken;

  console.log('1) cliente: código por e-mail');
  const email = 'QA-Mail1@Teste.com'; // maiúsculas de propósito: deve virar minúsculas
  await req('POST', '/publico/clientes', { nome: 'QA Mail Cliente', email, telefone: '44900000000', senha: 'senhaantiga1' });
  checar('e-mail salvo em minúsculas', sql(`SELECT email FROM clientes WHERE nome='QA Mail Cliente'`) === 'qa-mail1@teste.com');
  let r = await req('POST', '/auth/cliente/esqueci-senha', { email: 'QA-MAIL1@teste.com' });
  checar('200 com mensagem genérica', r.status === 200 && /Se o e-mail estiver cadastrado/.test(r.corpo.mensagem), JSON.stringify(r.corpo));
  await dormir(800);
  let rec = await recebidos();
  checar('1 e-mail enviado à Brevo', rec.length === 1, `qtd=${rec.length}`);
  const m1 = rec[0];
  checar('endereço e método da API corretos', m1?.url === '/v3/smtp/email' && m1?.metodo === 'POST');
  checar('cabeçalho api-key enviado', m1?.cabecalhos['api-key'] === 'chave-de-teste');
  checar('remetente configurado', m1?.corpo.sender.email === 'barbearia@teste.com' && m1?.corpo.sender.name === 'GV Barbearia');
  checar('destinatário é o cliente', m1?.corpo.to[0].email === 'qa-mail1@teste.com');
  checar('assunto em português', /código para redefinir a senha/.test(m1?.corpo.subject));
  const codigo = (m1?.corpo.textContent.match(/senha: (\d{6})/) || [])[1];
  checar('código de 6 dígitos no texto', !!codigo);
  checar('mesmo código no HTML', m1?.corpo.htmlContent.includes(codigo) && m1.corpo.htmlContent.includes('GV BARBEARIA'));
  checar('HTML não traz a senha nem hash', !/senhaantiga1|\$2[aby]\$/.test(m1?.corpo.htmlContent));

  r = await req('POST', '/auth/cliente/esqueci-senha', { email: 'qa-mail1@teste.com' });
  await dormir(500);
  checar('2º pedido em menos de 1 minuto: mesma resposta, mas sem novo e-mail', r.status === 200 && (await recebidos()).length === 1);
  r = await req('POST', '/auth/cliente/esqueci-senha', { email: 'naoexiste-qa@teste.com' });
  await dormir(500);
  checar('e-mail inexistente: mesma resposta e nenhum e-mail', r.status === 200 && /Se o e-mail estiver cadastrado/.test(r.corpo.mensagem) && (await recebidos()).length === 1);

  r = await req('POST', '/auth/cliente/redefinir-senha', { email: 'qa-mail1@teste.com', codigo: '000000', novaSenha: 'senhanova123' });
  checar('código errado -> 400', r.status === 400);
  r = await req('POST', '/auth/cliente/redefinir-senha', { email: 'qa-mail1@teste.com', codigo, novaSenha: 'senhanova123' });
  checar('código do e-mail redefine a senha', r.status === 200, JSON.stringify(r.corpo));
  await dormir(800);
  rec = await recebidos();
  checar('e-mail de aviso "senha alterada" enviado', rec.length === 2 && /senha foi alterada/.test(rec[1].corpo.subject));
  checar('login com a senha nova funciona', (await req('POST', '/auth/cliente/login', { email: 'qa-mail1@teste.com', senha: 'senhanova123' })).status === 200);
  checar('senha antiga não funciona mais', (await req('POST', '/auth/cliente/login', { email: 'qa-mail1@teste.com', senha: 'senhaantiga1' })).status === 401);
  checar('login aceita o e-mail com maiúsculas', (await req('POST', '/auth/cliente/login', { email: 'QA-Mail1@TESTE.com', senha: 'senhanova123' })).status === 200);
  r = await req('POST', '/auth/cliente/redefinir-senha', { email: 'qa-mail1@teste.com', codigo, novaSenha: 'outrasenha123' });
  checar('código não pode ser reutilizado', r.status === 400);

  console.log('2) administrador: link por e-mail');
  await mock('/__limpar', {});
  await req('POST', '/administradores', { nome: 'QA Mail Admin', login: 'qa-mail-admin@teste.com', senha: 'adminantiga1' }, A);
  r = await req('POST', '/auth/esqueci-senha', { login: 'qa-mail-admin@teste.com' });
  checar('200 genérico', r.status === 200 && /Se o e-mail estiver cadastrado/.test(r.corpo.mensagem));
  await dormir(800);
  rec = await recebidos();
  checar('1 e-mail enviado', rec.length === 1);
  const link = (rec[0]?.corpo.textContent.match(/(http\S+redefinir-senha\?token=[0-9a-f]+)/) || [])[1];
  checar('link aponta para o painel com token', !!link && link.startsWith('http://localhost:3001/login/redefinir-senha?token='), link);
  checar('HTML tem o botão e o link', rec[0]?.corpo.htmlContent.includes('Criar nova senha') && rec[0].corpo.htmlContent.includes(link));
  const token = link?.split('token=')[1];
  r = await req('POST', '/auth/redefinir-senha', { token: 'a'.repeat(64), novaSenha: 'qualquer123' });
  checar('token inválido -> 400', r.status === 400);
  r = await req('POST', '/auth/redefinir-senha', { token, novaSenha: 'adminnova123' });
  checar('token do e-mail redefine a senha', r.status === 200, JSON.stringify(r.corpo));
  await dormir(800);
  rec = await recebidos();
  checar('aviso "senha alterada" ao administrador', rec.length === 2 && /senha foi alterada/.test(rec[1].corpo.subject));
  checar('login com a senha nova', (await req('POST', '/auth/login', { login: 'qa-mail-admin@teste.com', senha: 'adminnova123' })).status === 200);
  checar('token não reutilizável', (await req('POST', '/auth/redefinir-senha', { token, novaSenha: 'outra123456' })).status === 400);

  console.log('3) falhas da Brevo não quebram a recuperação');
  await mock('/__limpar', {});
  await mock('/__modo', { status: 401 }); // chave errada / remetente não verificado
  await dormir(1100); // respeita o intervalo de 1 minuto? o cliente abaixo é outro
  await req('POST', '/publico/clientes', { nome: 'QA Mail Falha', email: 'qa-mail2@teste.com', telefone: '44900000000', senha: 'senha12345' });
  r = await req('POST', '/auth/cliente/esqueci-senha', { email: 'qa-mail2@teste.com' });
  await dormir(800);
  checar('Brevo 401: resposta continua 200 e genérica', r.status === 200 && /Se o e-mail estiver cadastrado/.test(r.corpo.mensagem));
  checar('Brevo 401: não tenta de novo (erro do cliente)', (await recebidos()).length === 1, `qtd=${(await recebidos()).length}`);
  await mock('/__limpar', {});
  await mock('/__modo', { status: 500 });
  await req('POST', '/publico/clientes', { nome: 'QA Mail Falha 3', email: 'qa-mail3@teste.com', telefone: '44900000000', senha: 'senha12345' });
  r = await req('POST', '/auth/cliente/esqueci-senha', { email: 'qa-mail3@teste.com' });
  await dormir(2500);
  checar('Brevo 500: 2 tentativas', (await recebidos()).length === 2, `qtd=${(await recebidos()).length}`);
  checar('Brevo 500: resposta ao cliente continua 200', r.status === 200);
  checar('API continua no ar depois das falhas', (await req('GET', '/publico/barbearia')).status === 200);
  await mock('/__modo', { status: 201 });

  limpar();
  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); try { limpar(); } catch {} process.exit(1); });
