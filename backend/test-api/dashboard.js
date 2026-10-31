// Testa o dashboard com atendimentos concluídos em datas conhecidas.
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); } };
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();

async function chamar(metodo, caminho, corpo, token) {
  const res = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null };
}

const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10); // dia em Brasília
const somar = (d, n) => { const [a, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(a, m - 1, dd + n)).toISOString().slice(0, 10); };

(async () => {
  const login = await chamar('POST', '/auth/login', { login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA });
  const t = login.corpo.accessToken;

  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email='teste-dash@teste.com')`);
  sql(`DELETE FROM clientes WHERE email='teste-dash@teste.com'`);

  const base = (await chamar('GET', '/dashboard', null, t)).corpo; // antes de inserir, para comparar o delta
  const cli = (await chamar('POST', '/publico/clientes', { nome: 'TESTE DASH', email: 'teste-dash@teste.com', telefone: '44900000000', senha: 'cliente123' }));
  const clienteId = Number(sql(`SELECT id FROM clientes WHERE email='teste-dash@teste.com'`));
  const corte = (await chamar('GET', '/servicos', null, t)).corpo.find((s) => s.nome === 'Corte');   // R$ 45
  const barba = (await chamar('GET', '/servicos', null, t)).corpo.find((s) => s.nome === 'Barba');   // R$ 40
  const gabriel = (await chamar('GET', '/profissionais', null, t)).corpo.find((p) => p.nome === 'Gabriel');
  const wesley = (await chamar('GET', '/profissionais', null, t)).corpo.find((p) => p.nome === 'Wesley');

  const inserir = (diaLocal, hora, servico, prof, status) =>
    sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${clienteId},${servico.id},${prof.id},('${diaLocal} ${hora}:00-03'::timestamptz AT TIME ZONE 'UTC'),'${status}',now())`);

  // concluídos: hoje 1, ontem 2, 5 dias atrás 1, 20 dias atrás 2, 40 dias atrás 1
  inserir(hoje, '00:30', corte, gabriel, 'CONCLUIDO');
  inserir(somar(hoje, -1), '10:00', corte, gabriel, 'CONCLUIDO');
  inserir(somar(hoje, -1), '14:00', barba, wesley, 'CONCLUIDO');
  inserir(somar(hoje, -5), '09:00', corte, wesley, 'CONCLUIDO');
  inserir(somar(hoje, -20), '16:00', corte, gabriel, 'CONCLUIDO');
  inserir(somar(hoje, -20), '17:00', barba, gabriel, 'CONCLUIDO');
  inserir(somar(hoje, -40), '10:00', corte, gabriel, 'CONCLUIDO');
  // não contam como passagem: cancelado e pendente (um hoje, um futuro)
  inserir(somar(hoje, -2), '11:00', corte, gabriel, 'CANCELADO');
  inserir(somar(hoje, 3), '11:00', corte, wesley, 'PENDENTE');
  inserir(hoje, '23:00', barba, wesley, 'CONFIRMADO');

  const r = await chamar('GET', '/dashboard', null, t);
  checar('GET /dashboard 200', r.status === 200, JSON.stringify(r.corpo).slice(0, 200));
  const d = r.corpo;
  const delta = (campo, p) => d.passagem[p][campo] - base.passagem[p][campo];
  const deltaAnt = (campo, p) => d.passagem[p].anterior[campo] - base.passagem[p].anterior[campo];

  const mesmoMes = (dia) => dia.slice(0, 7) === hoje.slice(0, 7);
  const contaMes = [0, -1, -1, -5, -20, -20].filter((n) => mesmoMes(somar(hoje, n))).length;

  console.log('1) passagem de clientes (variação causada pelos dados de teste)');
  checar('hoje +1', delta('atendimentos', 'hoje') === 1, delta('atendimentos', 'hoje'));
  checar('hoje faturamento +45', delta('faturamento', 'hoje') === 45);
  checar('hoje anterior (ontem) +2', deltaAnt('atendimentos', 'hoje') === 2);
  checar('ontem +2 e R$ 85', delta('atendimentos', 'ontem') === 2 && delta('faturamento', 'ontem') === 85);
  checar('ontem anterior (anteontem) +0 (o de anteontem foi cancelado)', deltaAnt('atendimentos', 'ontem') === 0);
  checar('7 dias +4 (hoje, ontem x2, 5 dias atrás)', delta('atendimentos', 'ultimos7Dias') === 4);
  checar('7 dias faturamento +175', delta('faturamento', 'ultimos7Dias') === 175, delta('faturamento', 'ultimos7Dias'));
  checar('30 dias +6', delta('atendimentos', 'ultimos30Dias') === 6);
  checar('30 dias anterior +1 (40 dias atrás)', deltaAnt('atendimentos', 'ultimos30Dias') === 1);
  checar('mês atual conta só os dias do mês', delta('atendimentos', 'mesAtual') === contaMes, `${delta('atendimentos', 'mesAtual')} vs ${contaMes}`);

  console.log('2) resumo do dia');
  const ids = (l) => l.map((a) => a.cliente.nome);
  checar('agenda de hoje inclui o concluído e o confirmado, em ordem', d.agendaHoje.filter((a) => a.cliente.nome === 'TESTE DASH').length === 2);
  checar('agenda não traz cancelados', !d.agendaHoje.some((a) => a.status === 'CANCELADO'));
  const horas = d.agendaHoje.map((a) => a.dataHora);
  checar('agenda ordenada por horário', JSON.stringify(horas) === JSON.stringify([...horas].sort()));
  checar('pendente futuro aparece nos pendentes', d.pendentes.some((a) => a.cliente.nome === 'TESTE DASH'));
  checar('pendentesTotal +1', d.pendentesTotal - base.pendentesTotal === 1);

  console.log('3) indicadores (30 dias)');
  const i = d.indicadores, b = base.indicadores;
  checar('total de agendamentos +7 no período (6 concluídos até hoje... conta os 9 de 30 dias)', i.agendamentos.total - b.agendamentos.total === 8, `${i.agendamentos.total - b.agendamentos.total}`);
  checar('cancelados +1', i.agendamentos.cancelados - b.agendamentos.cancelados === 1);
  checar('taxa de cancelamento coerente', Math.abs(i.agendamentos.taxaCancelamento - (i.agendamentos.cancelados / i.agendamentos.total) * 100) < 0.11);
  checar('clientes novos +1', i.clientes.novos - b.clientes.novos === 1);
  checar('top serviços tem Corte', i.topServicos.some((s) => s.nome === 'Corte'));
  checar('top serviços ordenado', i.topServicos.every((s, k, a) => k === 0 || a[k - 1].atendimentos >= s.atendimentos));
  checar('por profissional lista Gabriel e Wesley', ['Gabriel', 'Wesley'].every((n) => i.porProfissional.some((p) => p.nome === n)));
  // horário local: 14:00 de ontem cai na célula da hora 14

  console.log('4) segurança');
  checar('sem token 401', (await chamar('GET', '/dashboard')).status === 401);

  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\"=${clienteId}`);
  sql(`DELETE FROM clientes WHERE id=${clienteId}`);
  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); process.exit(1); });
