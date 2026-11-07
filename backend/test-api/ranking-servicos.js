// Testa o ranking de serviços mais agendados (GET /publico/servicos): o destaque
// é recalculado sozinho quando agendamentos entram, são cancelados ou ficam velhos.
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
let ok = 0, falhas = 0;
const checar = (nome, cond, extra = '') => {
  if (cond) ok++; else { falhas++; console.log('  FALHOU:', nome, extra); }
};
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();
const ranking = async () => (await (await fetch(`${API}/publico/servicos`)).json());
const destaque = (lista) => lista.filter((s) => s.emDestaque);

(async () => {
  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email='teste-rank@teste.com')`);
  sql(`DELETE FROM clientes WHERE email='teste-rank@teste.com'`);
  await fetch(`${API}/publico/clientes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: 'TESTE RANK', email: 'teste-rank@teste.com', telefone: '44900000000', senha: 'cliente123' }) });
  const clienteId = Number(sql(`SELECT id FROM clientes WHERE email='teste-rank@teste.com'`));
  const profId = Number(sql(`SELECT id FROM profissionais ORDER BY id LIMIT 1`));
  const inserir = (servicoId, qtd, status, diasAtras) => {
    for (let i = 0; i < qtd; i++) {
      sql(`INSERT INTO agendamentos(\\"clienteId\\",\\"servicoId\\",\\"profissionalId\\",\\"dataHora\\",status,\\"atualizadoEm\\") VALUES (${clienteId},${servicoId},${profId},now() - interval '${diasAtras} days' - interval '${i} minutes','${status}',now())`);
    }
  };

  const resumo = (l) => JSON.stringify(l.map((x) => [x.id, x.totalAgendamentos, x.emDestaque]));
  const antes = resumo(await ranking());

  try {
    // Garante movimento dentro da janela (os dados de demonstração podem estar mais velhos).
    if (destaque(await ranking()).length === 0) inserir((await ranking())[0].id, 3, 'CONFIRMADO', 1);
    const base = await ranking();
    checar('exatamente um serviço em destaque', destaque(base).length === 1);
    const atual = destaque(base)[0];
    checar('o destaque é o de maior total', base.every((s) => s.totalAgendamentos <= atual.totalAgendamentos));
    checar('resposta traz a janela do ranking', atual.janelaDoRankingDias === 7);

    const outro = base.filter((s) => s.id !== atual.id).sort((a, b) => a.totalAgendamentos - b.totalAgendamentos)[0];
    const falta = atual.totalAgendamentos - outro.totalAgendamentos;

    // Empata: vale o de menor id.
    inserir(outro.id, falta, 'CONFIRMADO', 1);
    let lista = await ranking();
    const empatados = lista.filter((s) => s.id === atual.id || s.id === outro.id);
    checar('empate: um só destaque', destaque(lista).length === 1);
    checar('empate: vence o de menor id', destaque(lista)[0].id === Math.min(...empatados.map((s) => s.id)));

    // Passa na frente: o novo vira destaque.
    inserir(outro.id, 1, 'CONFIRMADO', 0);
    lista = await ranking();
    checar('quem passa na frente vira o destaque', destaque(lista)[0]?.id === outro.id, JSON.stringify(destaque(lista).map((s) => s.nome)));
    checar('total do novo destaque subiu', lista.find((s) => s.id === outro.id).totalAgendamentos === atual.totalAgendamentos + 1);

    // Cancelados não contam: cancelando 2, o antigo volta.
    sql(`UPDATE agendamentos SET status='CANCELADO' WHERE id IN (SELECT id FROM agendamentos WHERE \\"clienteId\\"=${clienteId} ORDER BY id LIMIT 2)`);
    lista = await ranking();
    checar('cancelados saem da conta e o antigo volta ao destaque', destaque(lista)[0]?.id === atual.id);

    // Fora da janela (mais de 7 dias) não conta.
    inserir(outro.id, 20, 'CONCLUIDO', 10);
    lista = await ranking();
    checar('agendamentos com mais de 7 dias não contam', destaque(lista)[0]?.id === atual.id);

    // Futuros contam.
    inserir(outro.id, 5, 'PENDENTE', -10);
    lista = await ranking();
    checar('agendamentos futuros contam', destaque(lista)[0]?.id === outro.id);
  } finally {
    sql(`DELETE FROM agendamentos WHERE \\"clienteId\\"=${clienteId}`);
    sql(`DELETE FROM clientes WHERE id=${clienteId}`);
  }

  const depois = await ranking();
  checar('limpeza devolve o ranking original', resumo(depois) === antes);
  console.log(`ranking-servicos: ${ok} ok, ${falhas} falhas`);
  process.exit(falhas ? 1 : 0);
})();
