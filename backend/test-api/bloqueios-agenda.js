// Testa o bloqueio de datas passadas no painel e o bloqueio de agenda (feriado
// para todos os barbeiros e ausência de um barbeiro): cadastro, validações,
// efeito no app (horários e calendário), no painel e na exclusão do bloqueio.
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
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
const agoraBr = new Date(Date.now() - 3 * 3600 * 1000);
const hoje = agoraBr.toISOString().slice(0, 10);
const somar = (d, n) => { const [a, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(a, m - 1, dd + n)).toISOString().slice(0, 10); };
function proximo(diaSemana, minDias = 3) {
  let d = somar(hoje, minDias);
  while (new Date(`${d}T00:00:00Z`).getUTCDay() !== diaSemana) d = somar(d, 1);
  return d;
}
const iso = (data, hora) => new Date(`${data}T${hora}:00-03:00`).toISOString();

(async () => {
  const limpar = () => {
    sql(`DELETE FROM bloqueios_agenda WHERE motivo LIKE 'QA %'`);
    sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'teste-blq%@teste.com')`);
    sql(`DELETE FROM clientes WHERE email LIKE 'teste-blq%@teste.com'`);
    sql(`DELETE FROM administradores WHERE login='qa-bloqueios@teste.com'`);
  };
  limpar();
  const hash = await bcrypt.hash('admin-bloqueios-1', 10);
  sql(`INSERT INTO administradores(nome,login,senha,\\"atualizadoEm\\") VALUES ('QA Bloqueios','qa-bloqueios@teste.com','${hash}',now())`);
  const A = (await chamar('POST', '/auth/login', { login: 'qa-bloqueios@teste.com', senha: 'admin-bloqueios-1' })).corpo?.accessToken;
  checar('login do admin de teste', !!A);

  try {
    await chamar('POST', '/publico/clientes', { nome: 'TESTE BLQ', email: 'teste-blq1@teste.com', telefone: '44900000000', senha: 'cliente123' });
    const C = (await chamar('POST', '/auth/cliente/login', { email: 'teste-blq1@teste.com', senha: 'cliente123' })).corpo.accessToken;
    const clienteId = Number(sql(`SELECT id FROM clientes WHERE email='teste-blq1@teste.com'`));
    const corte = (await chamar('GET', '/publico/servicos')).corpo.find((s) => s.nome === 'Corte');
    const profs = (await chamar('GET', '/publico/profissionais')).corpo;
    const gabriel = profs.find((p) => p.nome === 'Gabriel');
    const wesley = profs.find((p) => p.nome === 'Wesley');
    checar('dados reais existem', corte && gabriel && wesley);

    const horarios = async (prof, data) => (await chamar('GET', `/meus-agendamentos/horarios-disponiveis?servicoId=${corte.id}&profissionalId=${prof.id}&data=${data}`, null, C));
    const agendar = (prof, data, hora) => chamar('POST', '/meus-agendamentos', { servicoId: corte.id, profissionalId: prof.id, dataHora: iso(data, hora) }, C);
    const admAgendar = (prof, dataHora) => chamar('POST', '/agendamentos', { clienteId, servicoId: corte.id, profissionalId: prof.id, dataHora }, A);
    const bloquear = (corpo) => chamar('POST', '/bloqueios-agenda', corpo, A);
    const datasApp = async (prof) => (await chamar('GET', `/meus-agendamentos/datas-bloqueadas?profissionalId=${prof.id}`, null, C)).corpo.datas;

    console.log('1) datas passadas');
    const ontem = somar(hoje, -1);
    let r = await admAgendar(gabriel, iso(ontem, '10:00'));
    checar('painel: agendar ontem -> 400', r.status === 400 && /já passou/.test(r.corpo.message), JSON.stringify(r.corpo));
    r = await admAgendar(gabriel, '2020-03-02T13:00:00.000Z');
    checar('painel: agendar em 2020 -> 400', r.status === 400);
    r = await agendar(gabriel, ontem, '10:00');
    checar('app: agendar ontem -> 400', r.status === 400, JSON.stringify(r.corpo));
    const diaFuturo = proximo(2, 20); // terça
    r = await admAgendar(gabriel, iso(diaFuturo, '10:00'));
    checar('painel: agendar dia futuro -> 201', r.status === 201, JSON.stringify(r.corpo));
    const existente = r.corpo?.id;
    r = await chamar('PATCH', `/agendamentos/${existente}`, { dataHora: iso(ontem, '10:00') }, A);
    checar('painel: remarcar para ontem -> 400', r.status === 400, JSON.stringify(r.corpo));
    r = await chamar('PATCH', `/agendamentos/${existente}`, { dataHora: iso(diaFuturo, '10:00'), status: 'PENDENTE' }, A);
    checar('painel: editar sem mudar o horário -> 200', r.status === 200, JSON.stringify(r.corpo));
    // atendimento antigo: continua dando para mudar o status sem mexer na data
    sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${clienteId},${corte.id},${gabriel.id},'2020-03-02T13:00:00Z','CONFIRMADO',now())`);
    const antigo = Number(sql(`SELECT id FROM agendamentos WHERE \\"clienteId\\"=${clienteId} AND \\"dataHora\\"='2020-03-02T13:00:00Z'`));
    r = await chamar('PATCH', `/agendamentos/${antigo}`, { dataHora: '2020-03-02T13:00:00.000Z', status: 'CONCLUIDO' }, A);
    checar('painel: concluir atendimento antigo (mesma data) -> 200', r.status === 200, JSON.stringify(r.corpo));

    console.log('2) cadastro do bloqueio');
    checar('bloqueio sem login -> 401', (await chamar('POST', '/bloqueios-agenda', { dataInicio: hoje, dataFim: hoje, motivo: 'QA x' })).status === 401);
    checar('bloqueio com token de cliente -> 401', (await chamar('GET', '/bloqueios-agenda', null, C)).status === 401);
    checar('sem motivo -> 400', (await bloquear({ dataInicio: diaFuturo, dataFim: diaFuturo, motivo: '   ' })).status === 400);
    checar('data fora do formato -> 400', (await bloquear({ dataInicio: '25/12/2026', dataFim: '25/12/2026', motivo: 'QA x' })).status === 400);
    checar('data inexistente -> 400', (await bloquear({ dataInicio: '2027-02-30', dataFim: '2027-02-30', motivo: 'QA x' })).status === 400);
    checar('fim antes do início -> 400', (await bloquear({ dataInicio: somar(diaFuturo, 2), dataFim: diaFuturo, motivo: 'QA x' })).status === 400);
    checar('período inteiro no passado -> 400', (await bloquear({ dataInicio: somar(hoje, -5), dataFim: ontem, motivo: 'QA x' })).status === 400);
    checar('mais de 366 dias -> 400', (await bloquear({ dataInicio: hoje, dataFim: somar(hoje, 400), motivo: 'QA x' })).status === 400);
    checar('barbeiro inexistente -> 404', (await bloquear({ profissionalId: 999999, dataInicio: diaFuturo, dataFim: diaFuturo, motivo: 'QA x' })).status === 404);
    checar('campo extra -> 400', (await bloquear({ dataInicio: diaFuturo, dataFim: diaFuturo, motivo: 'QA x', extra: 1 })).status === 400);

    console.log('3) ausência de um barbeiro');
    const ausencia = await bloquear({ profissionalId: gabriel.id, dataInicio: diaFuturo, dataFim: somar(diaFuturo, 2), motivo: 'QA Folga do Gabriel' });
    checar('cadastra a ausência -> 201', ausencia.status === 201, JSON.stringify(ausencia.corpo));
    checar('avisa que já havia agendamento no período', ausencia.corpo?.agendamentosAfetados >= 1, JSON.stringify(ausencia.corpo));
    checar('resposta traz o nome do barbeiro', ausencia.corpo?.profissional?.nome === 'Gabriel');
    r = await horarios(gabriel, diaFuturo);
    checar('app: horários do Gabriel no 1º dia -> vazio e bloqueado', r.status === 200 && r.corpo.horarios.length === 0 && r.corpo.bloqueado === true, JSON.stringify(r.corpo));
    r = await horarios(gabriel, somar(diaFuturo, 2));
    checar('app: último dia do período também bloqueado', r.corpo.bloqueado === true);
    r = await horarios(wesley, diaFuturo);
    checar('app: o Wesley continua com horários', r.corpo.bloqueado === false && r.corpo.horarios.length > 0);
    r = await agendar(gabriel, diaFuturo, '11:00');
    checar('app: agendar com o Gabriel no período -> 409 com motivo', r.status === 409 && /Folga do Gabriel/.test(r.corpo.message), JSON.stringify(r.corpo));
    r = await agendar(wesley, diaFuturo, '11:00');
    checar('app: agendar com o Wesley no mesmo dia -> 201', r.status === 201, JSON.stringify(r.corpo));
    r = await admAgendar(gabriel, iso(diaFuturo, '15:00'));
    checar('painel: agendar com o Gabriel no período -> 409', r.status === 409 && /bloqueada/.test(r.corpo.message), JSON.stringify(r.corpo));
    const diaLivre = somar(diaFuturo, 7);
    r = await admAgendar(gabriel, iso(diaLivre, '10:30'));
    checar('painel: depois do período volta a aceitar', r.status === 201, JSON.stringify(r.corpo));
    r = await chamar('PATCH', `/agendamentos/${r.corpo.id}`, { dataHora: iso(somar(diaFuturo, 1), '10:30') }, A);
    checar('painel: remarcar para dentro do período -> 409', r.status === 409, JSON.stringify(r.corpo));
    r = await chamar('PATCH', `/agendamentos/${existente}`, { profissionalId: gabriel.id, status: 'CANCELADO' }, A);
    checar('painel: cancelar agendamento que já existia no período -> 200', r.status === 200, JSON.stringify(r.corpo));
    const datasG = await datasApp(gabriel);
    checar('calendário do app: Gabriel com os 3 dias', [0, 1, 2].every((i) => datasG.includes(somar(diaFuturo, i))) && !datasG.includes(somar(diaFuturo, 3)), JSON.stringify(datasG));
    const datasW = await datasApp(wesley);
    checar('calendário do app: Wesley sem esses dias', !datasW.includes(diaFuturo));
    checar('datas bloqueadas com barbeiro inexistente -> 404', (await chamar('GET', '/meus-agendamentos/datas-bloqueadas?profissionalId=999999', null, C)).status === 404);
    checar('datas bloqueadas sem login -> 401', (await chamar('GET', `/meus-agendamentos/datas-bloqueadas?profissionalId=${gabriel.id}`)).status === 401);
    checar('a resposta do app não traz o motivo', !JSON.stringify(await chamar('GET', `/meus-agendamentos/datas-bloqueadas?profissionalId=${gabriel.id}`, null, C)).includes('Folga'));

    console.log('4) feriado para todos');
    const feriado = await bloquear({ dataInicio: diaLivre, dataFim: diaLivre, motivo: 'QA Feriado' });
    checar('cadastra o feriado (sem barbeiro) -> 201', feriado.status === 201 && feriado.corpo.profissionalId === null, JSON.stringify(feriado.corpo));
    checar('avisa do agendamento do Gabriel nesse dia', feriado.corpo?.agendamentosAfetados >= 1, JSON.stringify(feriado.corpo));
    for (const p of [gabriel, wesley]) {
      r = await horarios(p, diaLivre);
      checar(`feriado bloqueia ${p.nome}`, r.corpo.bloqueado === true && r.corpo.horarios.length === 0);
    }
    r = await agendar(wesley, diaLivre, '16:00');
    checar('app: agendar no feriado -> 409', r.status === 409 && /Feriado/.test(r.corpo.message));
    checar('calendário do app: feriado aparece para os dois', (await datasApp(gabriel)).includes(diaLivre) && (await datasApp(wesley)).includes(diaLivre));
    const lista = await chamar('GET', '/bloqueios-agenda', null, A);
    const meus = lista.corpo.filter((b) => b.motivo.startsWith('QA '));
    checar('lista traz os 2 bloqueios, do mais próximo ao mais distante', lista.status === 200 && meus.length === 2 && meus[0].dataInicio <= meus[1].dataInicio, JSON.stringify(meus));

    console.log('5) hoje e bloqueios que começaram antes');
    const hojeBloq = await bloquear({ dataInicio: somar(hoje, -3), dataFim: hoje, motivo: 'QA Termina hoje' });
    checar('período que termina hoje é aceito', hojeBloq.status === 201, JSON.stringify(hojeBloq.corpo));
    r = await admAgendar(wesley, new Date(Date.now() + 3600_000).toISOString());
    checar('painel: agendar hoje (já bloqueado) -> 409', r.status === 409, JSON.stringify(r.corpo));

    console.log('6) excluir o bloqueio');
    checar('excluir sem login -> 401', (await chamar('DELETE', `/bloqueios-agenda/${feriado.corpo.id}`)).status === 401);
    checar('excluir id inválido -> 400', (await chamar('DELETE', '/bloqueios-agenda/abc', null, A)).status === 400);
    checar('excluir o feriado -> 200', (await chamar('DELETE', `/bloqueios-agenda/${feriado.corpo.id}`, null, A)).status === 200);
    checar('excluir de novo -> 404', (await chamar('DELETE', `/bloqueios-agenda/${feriado.corpo.id}`, null, A)).status === 404);
    r = await horarios(wesley, diaLivre);
    checar('app: o dia volta a ter horários', r.corpo.bloqueado === false && r.corpo.horarios.length > 0);
    r = await agendar(wesley, diaLivre, '16:00');
    checar('app: volta a agendar no dia', r.status === 201, JSON.stringify(r.corpo));
    checar('a ausência do Gabriel continua valendo', (await horarios(gabriel, diaFuturo)).corpo.bloqueado === true);

    console.log('7) painel só agenda no horário de funcionamento');
    const terca = proximo(2, 40), domingo = proximo(0, 40), sabado = proximo(6, 40);
    const rotulo = (rr) => JSON.stringify(rr.corpo);
    r = await admAgendar(wesley, iso(terca, '13:30'));
    checar('terça 13:30 (almoço) -> 400', r.status === 400 && /fora do horário de atendimento/.test(r.corpo.message), rotulo(r));
    r = await admAgendar(wesley, iso(terca, '08:00'));
    checar('terça 08:00 (antes de abrir) -> 400', r.status === 400, rotulo(r));
    r = await admAgendar(wesley, iso(terca, '21:00'));
    checar('terça 21:00 (já fechou) -> 400', r.status === 400, rotulo(r));
    r = await admAgendar(wesley, iso(terca, '20:30'));
    checar('terça 20:30 com serviço de 1 h (passa do fechamento) -> 400', r.status === 400, rotulo(r));
    r = await admAgendar(wesley, iso(terca, '10:15'));
    checar('terça 10:15 (fora da grade de 30 min) -> 400', r.status === 400, rotulo(r));
    r = await admAgendar(wesley, iso(domingo, '10:00'));
    checar('domingo (fechado) -> 400', r.status === 400, rotulo(r));
    r = await admAgendar(wesley, iso(sabado, '18:00'));
    checar('sábado 18:00 (já fechou) -> 400', r.status === 400, rotulo(r));
    r = await admAgendar(wesley, iso(sabado, '08:00'));
    checar('sábado 08:00 (abre às 8h) -> 201', r.status === 201, rotulo(r));
    const dentro = r.corpo?.id;
    r = await admAgendar(wesley, iso(terca, '12:00'));
    checar('terça 12:00 (última da manhã) -> 201', r.status === 201, rotulo(r));
    const manha = r.corpo?.id;
    r = await chamar('PATCH', `/agendamentos/${manha}`, { dataHora: iso(terca, '13:30') }, A);
    checar('remarcar para 13:30 -> 400', r.status === 400, rotulo(r));
    r = await chamar('PATCH', `/agendamentos/${manha}`, { dataHora: iso(terca, '15:00') }, A);
    checar('remarcar para 15:00 -> 200', r.status === 200, rotulo(r));
    r = await chamar('PATCH', `/agendamentos/${manha}`, { dataHora: iso(terca, '15:00'), status: 'CONFIRMADO' }, A);
    checar('editar sem mudar o horário -> 200', r.status === 200, rotulo(r));
    // atendimento antigo marcado fora do expediente (ex.: lançado antes da regra): só mudar o status continua dando
    sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${clienteId},${corte.id},${wesley.id},'${iso(terca, '23:00')}','CONFIRMADO',now())`);
    const foraId = Number(sql(`SELECT id FROM agendamentos WHERE \\"clienteId\\"=${clienteId} AND \\"dataHora\\"='${iso(terca, '23:00')}'`));
    r = await chamar('PATCH', `/agendamentos/${foraId}`, { dataHora: iso(terca, '23:00'), status: 'CANCELADO' }, A);
    checar('cancelar agendamento antigo fora do expediente -> 200', r.status === 200, rotulo(r));

    const slots = (q) => chamar('GET', `/agendamentos/horarios-disponiveis?${q}`, null, A);
    const base = `servicoId=${corte.id}&profissionalId=${wesley.id}`;
    r = await slots(`${base}&data=${somar(terca, 7)}`);
    checar('lista do painel: terça tem 18 horários, de 09:00 a 20:00, sem 13:00-14:30', r.status === 200 && r.corpo.horarios.length === 18 && r.corpo.horarios[0].hora === '09:00' && r.corpo.horarios.at(-1).hora === '20:00' && !r.corpo.horarios.some((h) => ['13:00', '13:30', '14:00', '14:30'].includes(h.hora)), rotulo(r));
    r = await slots(`${base}&data=${domingo}`);
    checar('lista do painel: domingo vazio', r.status === 200 && r.corpo.horarios.length === 0);
    r = await slots(`${base}&data=${somar(hoje, 200)}`);
    checar('lista do painel: sem limite de 60 dias', r.status === 200);
    r = await slots(`${base}&data=${terca}`);
    checar('lista do painel: não oferece o horário já ocupado (15:00)', r.corpo.horarios.every((h) => h.hora !== '15:00'));
    r = await slots(`${base}&data=${terca}&agendamentoId=${manha}`);
    checar('lista do painel: ao remarcar, o horário do próprio agendamento aparece', r.corpo.horarios.some((h) => h.hora === '15:00'));
    r = await slots(`servicoId=${corte.id}&profissionalId=${gabriel.id}&data=${diaFuturo}`);
    checar('lista do painel: dia bloqueado traz bloqueado=true e nenhum horário', r.corpo.bloqueado === true && r.corpo.horarios.length === 0, rotulo(r));
    r = await slots(`servicoId=${corte.id}&profissionalId=999999&data=${terca}`);
    checar('lista do painel: barbeiro inexistente -> 404', r.status === 404);
    checar('lista do painel sem login -> 401', (await chamar('GET', `/agendamentos/horarios-disponiveis?${base}&data=${terca}`)).status === 401);
    checar('lista do painel com token de cliente -> 401', (await chamar('GET', `/agendamentos/horarios-disponiveis?${base}&data=${terca}`, null, C)).status === 401);
    void dentro;

    console.log('8) barbeiro excluído leva o bloqueio junto');
    const temp = (await chamar('POST', '/profissionais', { nome: 'QA Barbeiro Temp', especialidade: 'x', descricao: 'x' }, A)).corpo;
    const bt = await bloquear({ profissionalId: temp.id, dataInicio: diaFuturo, dataFim: diaFuturo, motivo: 'QA Temp' });
    checar('bloqueio do barbeiro temporário criado', bt.status === 201);
    await chamar('DELETE', `/profissionais/${temp.id}`, null, A);
    checar('excluir o barbeiro apagou o bloqueio', Number(sql(`SELECT count(*) FROM bloqueios_agenda WHERE motivo='QA Temp'`)) === 0);
  } finally {
    sql(`DELETE FROM profissionais WHERE nome LIKE 'QA Barbeiro Temp%'`);
    limpar();
  }
  console.log(`bloqueios de agenda: ${ok} checagens ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})();
