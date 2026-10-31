// Dados temporários para ver o dashboard com movimento. `node demo_dashboard.js` cria; `... limpar` remove.
const { execSync } = require('child_process');
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();

if (process.argv[2] === 'limpar') {
  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'demo-dash-%@teste.com')`);
  sql(`DELETE FROM clientes WHERE email LIKE 'demo-dash-%@teste.com'`);
  console.log('removido:', sql(`SELECT (SELECT count(*) FROM clientes),(SELECT count(*) FROM agendamentos)`));
  process.exit(0);
}

const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
const somar = (d, n) => { const [a, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(a, m - 1, dd + n)).toISOString().slice(0, 10); };
const diaSemana = (d) => { const [a, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(a, m - 1, dd)).getUTCDay(); };

const nomes = ['Carlos Silva', 'João Pereira', 'Marcos Lima', 'Rafael Souza', 'Lucas Alves', 'Pedro Costa', 'André Rocha', 'Felipe Gomes', 'Bruno Dias', 'Diego Martins'];
sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'demo-dash-%@teste.com')`);
sql(`DELETE FROM clientes WHERE email LIKE 'demo-dash-%@teste.com'`);
const clientes = nomes.map((n, i) => {
  const id = sql(`INSERT INTO clientes(nome,email,telefone,senha,\\"atualizadoEm\\",\\"criadoEm\\") VALUES ('${n}','demo-dash-${i}@teste.com','4499000000${i}','x',now(), now() - interval '${(i * 6) % 40} days') RETURNING id`).split('\n')[0];
  return Number(id);
});
const servicos = sql(`SELECT id, duracaoMinutos FROM servicos`.replace('duracaoMinutos', '\\"duracaoMinutos\\"')).split('\n').map((l) => l.split('|').map(Number));
const profs = sql(`SELECT id FROM profissionais`).split('\n').map(Number);

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const horas = [9, 10, 11, 12, 15, 16, 17, 18, 19, 20];

let n = 0;
for (let off = -45; off <= 0; off++) {
  const dia = somar(hoje, off);
  const ds = diaSemana(dia);
  if (ds === 0) continue;
  const qtd = ds === 6 ? 6 + Math.floor(rnd() * 4) : 3 + Math.floor(rnd() * 5);
  const usados = new Set();
  for (let k = 0; k < qtd; k++) {
    const h = ds === 6 ? pick([8, 9, 10, 11, 12, 14, 15, 16, 17]) : pick(horas);
    const m = pick([0, 30]);
    const prof = pick(profs);
    const chave = `${prof}-${h}-${m}`;
    if (usados.has(chave)) continue;
    usados.add(chave);
    const [sid] = pick(servicos);
    const status = rnd() < 0.08 ? 'CANCELADO' : 'CONCLUIDO';
    const hh = String(h).padStart(2, '0'), mm = String(m).padStart(2, '0');
    // hoje: só horários que já passaram contam como concluídos
    sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${pick(clientes)},${sid},${prof},('${dia} ${hh}:${mm}:00-03'::timestamptz AT TIME ZONE 'UTC'),'${status}',now())`);
    n++;
  }
}
// pendentes futuros e agenda de hoje
for (const [off, h, m] of [[1, 10, 0], [1, 15, 30], [2, 9, 30], [2, 17, 0], [3, 11, 0]]) {
  const dia = somar(hoje, off);
  if (diaSemana(dia) === 0) continue;
  sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${pick(clientes)},${pick(servicos)[0]},${pick(profs)},('${dia} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03'::timestamptz AT TIME ZONE 'UTC'),'PENDENTE',now())`);
}
for (const [h, m, st] of [[21, 0, 'CONFIRMADO'], [22, 0, 'CONFIRMADO']]) {
  sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${pick(clientes)},${pick(servicos)[0]},${pick(profs)},('${hoje} ${h}:${String(m).padStart(2, '0')}:00-03'::timestamptz AT TIME ZONE 'UTC'),'${st}',now())`);
}
console.log('criados', n, 'agendamentos de demonstração');
