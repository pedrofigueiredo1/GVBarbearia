// Testa a grade de horários, a consulta de horários livres e o agendamento do cliente.
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => {
  if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); }
};
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

// datas no horário de Brasília (UTC-3)
const hoje = new Date(Date.now() - 3 * 3600 * 1000);
function proximo(diaSemana, minDias = 3) {
  const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + minDias));
  while (d.getUTCDay() !== diaSemana) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
const iso = (data, hora) => new Date(`${data}T${hora}:00-03:00`).toISOString();

(async () => {
  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'teste-hor%@teste.com')`);
  sql(`DELETE FROM clientes WHERE email LIKE 'teste-hor%@teste.com'`);

  const cadastrar = async (n) => {
    await chamar('POST', '/publico/clientes', { nome: `TESTE HOR ${n}`, email: `teste-hor${n}@teste.com`, telefone: '44900000000', senha: 'cliente123' });
    return (await chamar('POST', '/auth/cliente/login', { email: `teste-hor${n}@teste.com`, senha: 'cliente123' })).corpo.accessToken;
  };
  const t1 = await cadastrar(1);
  const t2 = await cadastrar(2);

  const servicos = (await chamar('GET', '/publico/servicos')).corpo;
  const profs = (await chamar('GET', '/publico/profissionais')).corpo;
  const corte = servicos.find((s) => s.nome === 'Corte');
  const pezinho = servicos.find((s) => s.nome === 'Pezinho');
  const gabriel = profs.find((p) => p.nome === 'Gabriel');
  const wesley = profs.find((p) => p.nome === 'Wesley');
  checar('dados reais existem', corte && pezinho && gabriel && wesley);

  const seg = proximo(1, 14), sab = proximo(6, 14), dom = proximo(0, 14);
  const horarios = async (token, serv, prof, data) => {
    const r = await chamar('GET', `/meus-agendamentos/horarios-disponiveis?servicoId=${serv.id}&profissionalId=${prof.id}&data=${data}`, null, token);
    return { status: r.status, lista: (r.corpo.horarios || []).map((h) => h.hora), bruto: r.corpo };
  };

  console.log('1) grade por dia');
  let r = await horarios(t1, corte, gabriel, seg);
  checar('segunda Corte: 18 horários', r.lista.length === 18, r.lista.join(','));
  checar('segunda primeiro 09:00', r.lista[0] === '09:00');
  checar('segunda manhã termina 12:00', r.lista.includes('12:00') && !r.lista.includes('12:30') && !r.lista.includes('13:00'));
  checar('segunda sem 13:00-14:30', !['13:00', '13:30', '14:00', '14:30'].some((h) => r.lista.includes(h)));
  checar('segunda tarde 15:00..20:00', r.lista.includes('15:00') && r.lista.includes('20:00') && !r.lista.includes('20:30'));
  r = await horarios(t1, pezinho, gabriel, seg);
  checar('segunda Pezinho(15min): 20 horários, até 12:30 e 20:30', r.lista.length === 20 && r.lista.includes('12:30') && r.lista.includes('20:30'), r.lista.join(','));
  r = await horarios(t1, corte, gabriel, sab);
  checar('sábado Corte: 16 horários', r.lista.length === 16, r.lista.join(','));
  checar('sábado começa 08:00, manhã até 12:00, tarde 14:00..17:00', r.lista[0] === '08:00' && r.lista.includes('12:00') && !r.lista.includes('13:00') && r.lista.includes('14:00') && r.lista.includes('17:00') && !r.lista.includes('17:30'));
  r = await horarios(t1, corte, gabriel, dom);
  checar('domingo sem horários', r.status === 200 && r.lista.length === 0);
  r = await horarios(t1, corte, gabriel, proximo(1, -14 + 7 * 0).replace(/^/, '') && '2020-01-06');
  checar('data passada sem horários', r.status === 200 && r.lista.length === 0);

  console.log('2) validações da consulta');
  const q = (s) => chamar('GET', `/meus-agendamentos/horarios-disponiveis?${s}`, null, t1);
  checar('data inválida (30/02) -> 400', (await q(`servicoId=${corte.id}&profissionalId=${gabriel.id}&data=2027-02-30`)).status === 400);
  checar('formato errado -> 400', (await q(`servicoId=${corte.id}&profissionalId=${gabriel.id}&data=abc`)).status === 400);
  checar('sem data -> 400', (await q(`servicoId=${corte.id}&profissionalId=${gabriel.id}`)).status === 400);
  checar('serviço inexistente -> 404', (await q(`servicoId=999999&profissionalId=${gabriel.id}&data=${seg}`)).status === 404);
  checar('profissional inexistente -> 404', (await q(`servicoId=${corte.id}&profissionalId=999999&data=${seg}`)).status === 404);
  checar('sem token -> 401', (await chamar('GET', `/meus-agendamentos/horarios-disponiveis?servicoId=${corte.id}&profissionalId=${gabriel.id}&data=${seg}`)).status === 401);

  console.log('3) agendar fora da grade');
  const post = (token, serv, prof, data, hora) => chamar('POST', '/meus-agendamentos', { servicoId: serv.id, profissionalId: prof.id, dataHora: iso(data, hora) }, token);
  checar('13:00 -> 400', (await post(t1, corte, gabriel, seg, '13:00')).status === 400);
  checar('09:15 (fora da grade) -> 400', (await post(t1, corte, gabriel, seg, '09:15')).status === 400);
  checar('12:30 Corte termina 13:30 -> 400', (await post(t1, corte, gabriel, seg, '12:30')).status === 400);
  checar('domingo 10:00 -> 400', (await post(t1, corte, gabriel, dom, '10:00')).status === 400);
  checar('sábado 13:30 -> 400', (await post(t1, corte, gabriel, sab, '13:30')).status === 400);
  checar('08:00 segunda (antes de abrir) -> 400', (await post(t1, corte, gabriel, seg, '08:00')).status === 400);
  const fora = await post(t1, corte, gabriel, seg, '13:00');
  checar('mensagem de fora do horário', /fora do horário de atendimento/.test(fora.corpo.message), JSON.stringify(fora.corpo));

  console.log('4) agendar dentro da grade e efeito nos horários livres');
  const a1 = await post(t1, corte, gabriel, seg, '10:00');
  checar('Corte 10:00 -> 201 PENDENTE', a1.status === 201 && a1.corpo.status === 'PENDENTE', JSON.stringify(a1.corpo));
  r = await horarios(t1, corte, gabriel, seg);
  checar('10:00, 09:30 e 10:30 somem (choque de duração)', !['09:30', '10:00', '10:30'].some((h) => r.lista.includes(h)), r.lista.join(','));
  checar('09:00 e 11:00 continuam livres', r.lista.includes('09:00') && r.lista.includes('11:00'));
  r = await horarios(t2, pezinho, gabriel, seg);
  checar('outro cliente, Pezinho(15): 10:00 e 10:30 invadem o Corte (10:00-11:00); 09:30 e 11:00 livres', !r.lista.includes('10:00') && !r.lista.includes('10:30') && r.lista.includes('09:30') && r.lista.includes('11:00'), r.lista.join(','));
  r = await horarios(t1, corte, wesley, seg);
  checar('mesmo cliente, outro profissional: horários que batem com o próprio agendamento somem', !['09:30', '10:00', '10:30'].some((h) => r.lista.includes(h)));
  r = await horarios(t2, corte, wesley, seg);
  checar('outro cliente com Wesley: 10:00 livre', r.lista.includes('10:00'));

  console.log('5) conflitos');
  const igual = await post(t2, corte, gabriel, seg, '10:00');
  checar('mesmo profissional e horário -> 409 (mensagem antiga)', igual.status === 409 && /nesse mesmo horário/.test(igual.corpo.message), JSON.stringify(igual.corpo));
  const sobre = await post(t2, corte, gabriel, seg, '10:30');
  checar('invade o atendimento -> 409', sobre.status === 409 && /não está mais disponível/.test(sobre.corpo.message), JSON.stringify(sobre.corpo));
  const propria = await post(t1, corte, wesley, seg, '10:00');
  checar('mesmo cliente, mesmo horário -> 409', propria.status === 409, JSON.stringify(propria.corpo));
  const propria2 = await post(t1, corte, wesley, seg, '10:30');
  checar('mesmo cliente, horário que invade o seu -> 409', propria2.status === 409, JSON.stringify(propria2.corpo));
  const a2 = await post(t2, corte, wesley, seg, '10:00');
  checar('outro cliente com Wesley 10:00 -> 201', a2.status === 201, JSON.stringify(a2.corpo));
  const a3 = await post(t1, corte, gabriel, seg, '11:00');
  checar('logo depois do atendimento (11:00) -> 201', a3.status === 201, JSON.stringify(a3.corpo));
  const a4 = await post(t1, pezinho, gabriel, seg, '09:30');
  checar('Pezinho 09:30 antes do Corte das 10:00 (termina 09:45) -> 201', a4.status === 201, JSON.stringify(a4.corpo));

  console.log('6) cancelar libera o horário');
  const c = await chamar('DELETE', `/meus-agendamentos/${a1.corpo.id}`, null, t1);
  checar('cancelamento 200', c.status === 200, JSON.stringify(c.corpo));
  r = await horarios(t1, corte, gabriel, seg);
  checar('10:00 volta a ficar livre', r.lista.includes('10:00'), r.lista.join(','));

  // O painel também só agenda dentro do expediente: testado em bloqueios-agenda.js (seção 7).

  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'teste-hor%@teste.com')`);
  sql(`DELETE FROM clientes WHERE email LIKE 'teste-hor%@teste.com'`);
  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); process.exit(1); });
