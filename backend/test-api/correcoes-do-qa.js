// Confere as correções do QA: corrida, reativação, concluir futuro, validações, exclusões, token.
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); } };
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();
async function req(metodo, caminho, { corpo, token } = {}) {
  const res = await fetch(`${API}${caminho}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: corpo ? JSON.stringify(corpo) : undefined });
  const t = await res.text();
  let j = null; try { j = t ? JSON.parse(t) : null; } catch { j = t; }
  return { status: res.status, corpo: j, cab: res.headers };
}
const hoje = new Date(Date.now() - 3 * 3600 * 1000);
const proximo = (dow, min) => { const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + min)); while (d.getUTCDay() !== dow) d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const iso = (d, h) => new Date(`${d}T${h}:00-03:00`).toISOString();

function limpar() {
  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'qa-%@teste.com') OR \\"servicoId\\" IN (SELECT id FROM servicos WHERE nome LIKE 'QA %')`);
  sql(`DELETE FROM clientes WHERE email LIKE 'qa-%@teste.com' OR nome LIKE 'QA %' OR nome = ''`);
  sql(`DELETE FROM servicos WHERE nome LIKE 'QA %'`);
  sql(`DELETE FROM produtos WHERE nome LIKE 'QA %'`);
  sql(`DELETE FROM profissionais WHERE nome LIKE 'QA %'`);
  sql(`DELETE FROM administradores WHERE login LIKE 'qa-%'`);
}
async function criarCliente(n) {
  const email = `qa-c${n}@teste.com`;
  await req('POST', '/publico/clientes', { corpo: { nome: `QA Cliente ${n}`, email, telefone: '44900000000', senha: 'cliente123' } });
  const l = await req('POST', '/auth/cliente/login', { corpo: { email, senha: 'cliente123' } });
  return { email, token: l.corpo.accessToken, id: Number(sql(`SELECT id FROM clientes WHERE email='${email}'`)) };
}

(async () => {
  limpar();
  const A = (await req('POST', '/auth/login', { corpo: { login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA } })).corpo.accessToken;
  const servicos = (await req('GET', '/servicos', { token: A })).corpo;
  const profs = (await req('GET', '/profissionais', { token: A })).corpo;
  const corte = servicos.find((s) => s.nome === 'Corte');
  const gabriel = profs.find((p) => p.nome === 'Gabriel'), wesley = profs.find((p) => p.nome === 'Wesley');

  console.log('1) corrida de agendamentos');
  const seg = proximo(1, 35);
  const cs = []; for (let i = 1; i <= 6; i++) cs.push(await criarCliente(i));
  const corrida = await Promise.all(cs.map((c) => req('POST', '/meus-agendamentos', { token: c.token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg, '10:00') } })));
  checar('6 pedidos simultâneos: exatamente 1 vence', corrida.filter((x) => x.status === 201).length === 1, corrida.map((x) => x.status).join(','));
  checar('os demais recebem 409', corrida.filter((x) => x.status === 409).length === 5, corrida.map((x) => x.status).join(','));
  // horários diferentes, mas que se sobrepõem (10:00-11:00 e 10:30-11:30), ao mesmo tempo
  const seg2 = proximo(1, 42);
  const corrida2 = await Promise.all([
    req('POST', '/meus-agendamentos', { token: cs[0].token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg2, '10:00') } }),
    req('POST', '/meus-agendamentos', { token: cs[1].token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg2, '10:30') } }),
    req('POST', '/meus-agendamentos', { token: cs[2].token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg2, '11:00') } }),
  ]);
  const venc = corrida2.filter((x) => x.status === 201).length;
  checar('3 pedidos que se sobrepõem em cadeia: no máximo 2 passam (10:00 e 11:00)', venc <= 2 && venc >= 1, corrida2.map((x) => x.status).join(','));
  checar('10:00 e 10:30 nunca passam juntos', !(corrida2[0].status === 201 && corrida2[1].status === 201));
  checar('o índice do banco existe', sql(`SELECT count(*) FROM pg_indexes WHERE indexname='agendamentos_profissional_horario_ativo_key'`) === '1');
  // o mesmo cliente nos dois profissionais ao mesmo tempo
  const seg3 = proximo(2, 35);
  const dupla = await Promise.all([
    req('POST', '/meus-agendamentos', { token: cs[3].token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg3, '16:00') } }),
    req('POST', '/meus-agendamentos', { token: cs[3].token, corpo: { servicoId: corte.id, profissionalId: wesley.id, dataHora: iso(seg3, '16:00') } }),
  ]);
  checar('mesmo cliente em dois barbeiros no mesmo horário: só 1 passa', dupla.filter((x) => x.status === 201).length === 1, dupla.map((x) => x.status).join(','));
  // admin: duas criações idênticas ao mesmo tempo
  const seg4 = proximo(3, 35);
  const adm = await Promise.all([1, 2].map((i) => req('POST', '/agendamentos', { token: A, corpo: { clienteId: cs[i].id, servicoId: corte.id, profissionalId: wesley.id, dataHora: iso(seg4, '09:00') } })));
  checar('painel: duas criações simultâneas no mesmo horário: só 1 passa', adm.filter((x) => x.status === 201).length === 1 && adm.filter((x) => x.status === 409).length === 1, adm.map((x) => x.status).join(','));

  console.log('2) reativar cancelado');
  const base = await req('POST', '/meus-agendamentos', { token: cs[4].token, corpo: { servicoId: corte.id, profissionalId: wesley.id, dataHora: iso(proximo(4, 35), '15:00') } });
  await req('DELETE', `/meus-agendamentos/${base.corpo.id}`, { token: cs[4].token });
  const outro = await req('POST', '/meus-agendamentos', { token: cs[5].token, corpo: { servicoId: corte.id, profissionalId: wesley.id, dataHora: iso(proximo(4, 35), '15:00') } });
  checar('outro cliente ocupa o horário liberado', outro.status === 201);
  const reativa = await req('PATCH', `/agendamentos/${base.corpo.id}`, { token: A, corpo: { status: 'CONFIRMADO' } });
  checar('reativar o cancelado agora dá 409', reativa.status === 409, JSON.stringify(reativa.corpo));
  await req('DELETE', `/meus-agendamentos/${outro.corpo.id}`, { token: cs[5].token });
  const reativa2 = await req('PATCH', `/agendamentos/${base.corpo.id}`, { token: A, corpo: { status: 'CONFIRMADO' } });
  checar('com o horário livre, reativar funciona', reativa2.status === 200, JSON.stringify(reativa2.corpo));

  console.log('3) concluir atendimento futuro');
  const fut = await req('PATCH', `/agendamentos/${base.corpo.id}`, { token: A, corpo: { status: 'CONCLUIDO' } });
  checar('concluir agendamento futuro -> 409', fut.status === 409 && /já começou/.test(fut.corpo.message), JSON.stringify(fut.corpo));
  // O painel não cria agendamento em data passada; o atendimento antigo entra direto no banco.
  const passadoId = Number(sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${cs[0].id},${corte.id},${gabriel.id},'2020-03-02T13:00:00Z','CONFIRMADO',now()) RETURNING id`).split('\n')[0]);
  checar('concluir agendamento passado -> 200', (await req('PATCH', `/agendamentos/${passadoId}`, { token: A, corpo: { status: 'CONCLUIDO' } })).status === 200);

  console.log('4) validações');
  const post = (rota, corpo) => req('POST', rota, { token: A, corpo });
  checar('cliente com nome em branco -> 400', (await post('/clientes', { nome: '   ', email: 'qa-esp@teste.com', telefone: '44900000000', senha: '123456' })).status === 400);
  checar('cadastro público com nome em branco -> 400', (await req('POST', '/publico/clientes', { corpo: { nome: '   ', email: 'qa-esp2@teste.com', telefone: '44900000000', senha: '123456' } })).status === 400);
  checar('serviço com nome em branco -> 400', (await post('/servicos', { nome: '  ', descricao: 'x', valor: 10, duracaoMinutos: 30 })).status === 400);
  checar('profissional com nome em branco -> 400', (await post('/profissionais', { nome: '  ', especialidade: 'x', descricao: 'x' })).status === 400);
  checar('produto com nome em branco -> 400', (await post('/produtos', { nome: '  ', descricao: 'x', preco: 10 })).status === 400);
  const aparado = await post('/servicos', { nome: '  QA Aparado  ', descricao: ' descrição ', valor: 10, duracaoMinutos: 30 });
  checar('nome é salvo sem espaços nas pontas', aparado.status === 201 && aparado.corpo.nome === 'QA Aparado' && aparado.corpo.descricao === 'descrição', JSON.stringify(aparado.corpo));
  let r = await post('/servicos', { nome: 'QA Valor Alto', descricao: 'x', valor: 100000000, duracaoMinutos: 30 });
  checar('valor muito alto -> 400 (e não 500)', r.status === 400, `${r.status}`);
  checar('valor no limite (99999999.99) é aceito', (await post('/servicos', { nome: 'QA Valor Limite', descricao: 'x', valor: 99999999.99, duracaoMinutos: 30 })).status === 201);
  checar('preço de produto muito alto -> 400', (await post('/produtos', { nome: 'QA Produto Alto', descricao: 'x', preco: 100000000 })).status === 400);
  checar('duração acima de 480 min -> 400', (await post('/servicos', { nome: 'QA Duracao', descricao: 'x', valor: 10, duracaoMinutos: 481 })).status === 400);
  checar('telefone inválido -> 400', (await req('POST', '/publico/clientes', { corpo: { nome: 'QA Tel', email: 'qa-tel@teste.com', telefone: 'abc', senha: '123456' } })).status === 400);
  checar('telefone com máscara é aceito', (await req('POST', '/publico/clientes', { corpo: { nome: 'QA Tel Ok', email: 'qa-tel2@teste.com', telefone: '(44) 99999-0000', senha: '123456' } })).status === 201);
  await req('POST', '/publico/clientes', { corpo: { nome: 'QA Caixa', email: 'qa-Caixa@Teste.com', telefone: '44900000000', senha: '123456' } });
  r = await req('POST', '/publico/clientes', { corpo: { nome: 'QA Caixa 2', email: 'qa-caixa@teste.com', telefone: '44900000000', senha: '123456' } });
  checar('e-mail com outra caixa -> 409 (mesma conta)', r.status === 409, `${r.status}`);
  checar('login com e-mail em outra caixa funciona', (await req('POST', '/auth/cliente/login', { corpo: { email: 'QA-CAIXA@teste.COM', senha: '123456' } })).status === 200);
  checar('administrador: login em maiúsculas entra', (await req('POST', '/auth/login', { corpo: { login: process.env.ADMIN_LOGIN.toUpperCase(), senha: process.env.ADMIN_SENHA } })).status === 200);
  checar('id gigante -> 400', (await req('GET', '/clientes/99999999999', { token: A })).status === 400);
  checar('id negativo -> 400', (await req('GET', '/servicos/-5', { token: A })).status === 400);
  checar('id inexistente -> 404', (await req('GET', '/servicos/2000000000', { token: A })).status === 404);

  console.log('5) antecedência máxima');
  checar('agendar daqui a 2 anos -> 400', (await req('POST', '/meus-agendamentos', { token: cs[0].token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(proximo(1, 800), '16:00') } })).status === 400);
  checar('consultar horários muito distantes -> 400', (await req('GET', `/meus-agendamentos/horarios-disponiveis?servicoId=${corte.id}&profissionalId=${gabriel.id}&data=${proximo(1, 800)}`, { token: cs[0].token })).status === 400);
  checar('consultar dentro do prazo (35 dias) -> 200', (await req('GET', `/meus-agendamentos/horarios-disponiveis?servicoId=${corte.id}&profissionalId=${gabriel.id}&data=${proximo(1, 35)}`, { token: cs[0].token })).status === 200);

  console.log('6) administradores');
  const qa = await post('/administradores', { nome: 'QA Admin', login: 'QA-Admin@Teste.com', senha: 'qaadmin123' });
  checar('login do admin salvo em minúsculas', qa.status === 201 && qa.corpo.login === 'qa-admin@teste.com', JSON.stringify(qa.corpo));
  const qaLogin = await req('POST', '/auth/login', { corpo: { login: 'qa-admin@teste.com', senha: 'qaadmin123' } });
  const tokenQa = qaLogin.corpo.accessToken;
  checar('não pode excluir a própria conta (409)', (await req('DELETE', `/administradores/${qa.corpo.id}`, { token: tokenQa })).status === 409);
  const adminRoot = (await req('GET', '/administradores', { token: A })).corpo.find((x) => x.login === process.env.ADMIN_LOGIN);
  checar('um admin pode excluir outro', (await req('DELETE', `/administradores/${qa.corpo.id}`, { token: A })).status === 200);
  checar('token do admin excluído deixa de valer (401)', (await req('GET', '/clientes', { token: tokenQa })).status === 401);
  checar('o administrador principal continua existindo', !!adminRoot);

  console.log('7) cabeçalhos');
  const cab = (await req('GET', '/publico/barbearia')).cab;
  checar('sem X-Powered-By', !cab.get('x-powered-by'));
  checar('X-Content-Type-Options presente', cab.get('x-content-type-options') === 'nosniff');
  checar('Strict-Transport-Security presente', !!cab.get('strict-transport-security'));

  limpar();
  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); try { limpar(); } catch {} process.exit(1); });
