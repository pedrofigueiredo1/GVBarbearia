// Um atendimento concluído não pode ser cancelado (nem pelo DELETE, nem pela edição).
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => { if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); } };
async function chamar(metodo, caminho, corpo, token) {
  const res = await fetch(`${API}${caminho}`, { method: metodo, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: corpo ? JSON.stringify(corpo) : undefined });
  const t = await res.text();
  return { status: res.status, corpo: t ? JSON.parse(t) : null };
}
(async () => {
  const l = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA }) });
  const t = (await l.json()).accessToken;
  const lista = (await chamar('GET', '/agendamentos/paginado?status=CONCLUIDO&limite=1', null, t)).corpo.itens;
  const concluido = lista[0];
  const aberto = (await chamar('GET', '/agendamentos/paginado?status=CONFIRMADO&limite=1', null, t)).corpo.itens[0];

  let r = await chamar('DELETE', `/agendamentos/${concluido.id}`, null, t);
  checar('DELETE em concluído -> 409', r.status === 409 && /concluído não pode ser cancelado/.test(r.corpo.message), JSON.stringify(r.corpo));
  r = await chamar('PATCH', `/agendamentos/${concluido.id}`, { status: 'CANCELADO' }, t);
  checar('PATCH status CANCELADO em concluído -> 409', r.status === 409, JSON.stringify(r.corpo));
  r = await chamar('GET', `/agendamentos/${concluido.id}`, null, t);
  checar('o concluído continua concluído', r.corpo.status === 'CONCLUIDO');
  r = await chamar('PATCH', `/agendamentos/${concluido.id}`, { dataHora: concluido.dataHora }, t);
  checar('editar outros campos do concluído continua permitido', r.status === 200, JSON.stringify(r.corpo).slice(0, 100));

  // Concluir um atendimento que ainda vai acontecer não é permitido
  const futuro = new Date(aberto.dataHora) > new Date();
  r = await chamar('PATCH', `/agendamentos/${aberto.id}`, { status: 'CONCLUIDO' }, t);
  checar('concluir um agendamento futuro -> 409', futuro ? r.status === 409 : r.status === 200, JSON.stringify(r.corpo));
  r = await chamar('DELETE', `/agendamentos/${aberto.id}`, null, t);
  checar('cancelar um confirmado -> 200', r.status === 200 && r.corpo.status === 'CANCELADO');
  await chamar('PATCH', `/agendamentos/${aberto.id}`, { status: 'CONFIRMADO' }, t); // restaura

  console.log(`\n${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error('ERRO', e); process.exit(1); });
