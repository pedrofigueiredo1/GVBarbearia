// Testa as listagens paginadas (clientes e agendamentos) e os filtros de agendamento.
// Precisa dos dados de demo_dashboard.js (clientes demo-dash-*).
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); } };
async function chamar(caminho, token) {
  const res = await fetch(`${API}${caminho}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null };
}

(async () => {
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA }) });
  const t = (await login.json()).accessToken;
  const g = (c) => chamar(c, t);

  console.log('1) clientes paginado');
  let r = await g('/clientes/paginado?limite=5');
  checar('200 e formato', r.status === 200 && Array.isArray(r.corpo.itens) && r.corpo.pagina === 1 && r.corpo.limite === 5, JSON.stringify(r.corpo).slice(0, 150));
  checar('no máximo 5 itens e total >= 10', r.corpo.itens.length === 5 && r.corpo.total >= 10);
  checar('padrão: limite 10 e página 1', (await g('/clientes/paginado')).corpo.limite === 10);
  const p1 = r.corpo.itens.map((c) => c.id);
  const p2 = (await g('/clientes/paginado?limite=5&pagina=2')).corpo.itens.map((c) => c.id);
  checar('página 2 traz outros clientes', p2.length > 0 && !p2.some((id) => p1.includes(id)));
  const ult = (await g(`/clientes/paginado?limite=5&pagina=${Math.ceil(r.corpo.total / 5) + 3}`)).corpo;
  checar('página além do fim vem vazia mas com total', ult.itens.length === 0 && ult.total === r.corpo.total);
  checar('nunca devolve a senha', r.corpo.itens.every((c) => !('senha' in c)));
  let b = await g('/clientes/paginado?busca=carlos');
  checar('busca por nome (sem diferenciar maiúsculas)', b.corpo.itens.length >= 1 && b.corpo.itens.every((c) => /carlos/i.test(c.nome + c.email + c.telefone)));
  b = await g('/clientes/paginado?busca=demo-dash-3');
  checar('busca por e-mail', b.corpo.total === 1 && b.corpo.itens[0].email === 'demo-dash-3@teste.com');
  b = await g('/clientes/paginado?busca=zzzinexistente');
  checar('busca sem resultado', b.status === 200 && b.corpo.total === 0 && b.corpo.itens.length === 0);
  const asc = (await g('/clientes/paginado?limite=100&ordenarPor=nome&direcao=asc')).corpo.itens.map((c) => c.nome);
  const desc = (await g('/clientes/paginado?limite=100&ordenarPor=nome&direcao=desc')).corpo.itens.map((c) => c.nome);
  checar('ordenação desc é o inverso da asc', JSON.stringify(asc.slice().reverse()) === JSON.stringify(desc) || (asc[0] !== desc[0]));
  checar('limite acima de 100 -> 400', (await g('/clientes/paginado?limite=101')).status === 400);
  checar('página 0 -> 400', (await g('/clientes/paginado?pagina=0')).status === 400);
  checar('ordenarPor inválido -> 400', (await g('/clientes/paginado?ordenarPor=senha')).status === 400);
  checar('direção inválida -> 400', (await g('/clientes/paginado?direcao=cima')).status === 400);
  checar('sem token -> 401', (await chamar('/clientes/paginado')).status === 401);
  checar('rota antiga /clientes continua devolvendo lista', Array.isArray((await g('/clientes')).corpo));

  console.log('2) agendamentos paginado');
  r = await g('/agendamentos/paginado?limite=10');
  checar('200, formato e 10 itens', r.status === 200 && r.corpo.itens.length === 10 && r.corpo.total > 100, JSON.stringify(r.corpo).slice(0, 120));
  const datas = r.corpo.itens.map((a) => a.dataHora);
  checar('padrão: mais recentes primeiro', JSON.stringify(datas) === JSON.stringify(datas.slice().sort().reverse()));
  const ascAg = (await g('/agendamentos/paginado?limite=10&direcao=asc')).corpo.itens.map((a) => a.dataHora);
  checar('direcao=asc ordena do mais antigo', JSON.stringify(ascAg) === JSON.stringify(ascAg.slice().sort()));
  checar('traz cliente, serviço e profissional', r.corpo.itens.every((a) => a.cliente?.nome && a.servico?.nome && a.profissional?.nome));
  let f = await g('/agendamentos/paginado?status=CANCELADO&limite=100');
  checar('filtro de status', f.corpo.total > 0 && f.corpo.itens.every((a) => a.status === 'CANCELADO'));
  const profs = (await g('/profissionais')).corpo;
  const gabriel = profs.find((p) => p.nome === 'Gabriel');
  f = await g(`/agendamentos/paginado?profissionalId=${gabriel.id}&limite=100`);
  checar('filtro de profissional', f.corpo.total > 0 && f.corpo.itens.every((a) => a.profissionalId === gabriel.id));
  f = await g('/agendamentos/paginado?busca=carlos&limite=100');
  checar('busca por nome do cliente', f.corpo.total > 0 && f.corpo.itens.every((a) => /carlos/i.test(a.cliente.nome + a.servico.nome + a.profissional.nome)));
  const ini = new Date(Date.now() - 10 * 86400000).toISOString(), fim = new Date(Date.now() - 5 * 86400000).toISOString();
  f = await g(`/agendamentos/paginado?dataInicio=${encodeURIComponent(ini)}&dataFim=${encodeURIComponent(fim)}&limite=100`);
  checar('filtro de período', f.corpo.total > 0 && f.corpo.itens.every((a) => a.dataHora >= ini && a.dataHora <= fim));
  f = await g(`/agendamentos/paginado?profissionalId=${gabriel.id}&status=CONCLUIDO&dataInicio=${encodeURIComponent(ini)}&limite=100`);
  checar('filtros combinados', f.corpo.itens.every((a) => a.profissionalId === gabriel.id && a.status === 'CONCLUIDO' && a.dataHora >= ini));
  const somaPaginas = async () => { let n = 0, pg = 1, cont = 0; for (;;) { const x = (await g(`/agendamentos/paginado?status=CANCELADO&limite=7&pagina=${pg}`)).corpo; n += x.itens.length; cont = x.total; if (x.itens.length === 0 || n >= x.total) break; pg++; } return [n, cont]; };
  const [lidos, totalCanc] = await somaPaginas();
  checar('percorrer todas as páginas soma o total', lidos === totalCanc, `${lidos} vs ${totalCanc}`);
  checar('status inválido -> 400', (await g('/agendamentos/paginado?status=XYZ')).status === 400);
  checar('limite 0 -> 400', (await g('/agendamentos/paginado?limite=0')).status === 400);
  checar('data inválida -> 400', (await g('/agendamentos/paginado?dataInicio=ontem')).status === 400);

  console.log('3) GET /agendamentos com filtros (usado pelo calendário)');
  const todos = (await g('/agendamentos')).corpo;
  checar('sem filtro devolve array com todos', Array.isArray(todos) && todos.length > 100);
  const dia = await g(`/agendamentos?dataInicio=${encodeURIComponent(ini)}&dataFim=${encodeURIComponent(fim)}`);
  checar('período devolve só os do recorte', Array.isArray(dia.corpo) && dia.corpo.length > 0 && dia.corpo.length < todos.length && dia.corpo.every((a) => a.dataHora >= ini && a.dataHora <= fim));
  const porProf = await g(`/agendamentos?profissionalId=${gabriel.id}`);
  checar('profissional devolve só dele', porProf.corpo.length > 0 && porProf.corpo.every((a) => a.profissionalId === gabriel.id));
  checar('status inválido -> 400', (await g('/agendamentos?status=XYZ')).status === 400);
  checar('paginado não é lido como id', (await g('/agendamentos/paginado')).status === 200);
  checar('buscar por id continua funcionando', (await g(`/agendamentos/${todos[0].id}`)).status === 200);

  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); process.exit(1); });
