// QA da API: procura comportamentos problemáticos e registra achados com gravidade.
const { execSync } = require('child_process');
const API = 'http://localhost:3000';
const achados = [];
let passou = 0;
const achado = (nivel, area, titulo, detalhe = '') => achados.push({ nivel, area, titulo, detalhe });
const ok = () => { passou++; };
const sql = (c) => execSync(`docker exec gvbarbearia-postgres psql -U gvbarbearia -d gvbarbearia -t -A -c "${c}"`, { encoding: 'utf8' }).trim();

async function req(metodo, caminho, { corpo, token, cabecalhos, bruto } = {}) {
  const res = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: { ...(bruto ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...cabecalhos },
    body: bruto ?? (corpo ? JSON.stringify(corpo) : undefined),
  });
  const t = await res.text();
  let json = null;
  try { json = t ? JSON.parse(t) : null; } catch { json = t; }
  return { status: res.status, corpo: json, cab: res.headers };
}

const hoje = new Date(Date.now() - 3 * 3600 * 1000);
const somar = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const proximo = (dow, min) => { let d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + min)); while (d.getUTCDay() !== dow) d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const iso = (data, hora) => new Date(`${data}T${hora}:00-03:00`).toISOString();

function limpar() {
  sql(`DELETE FROM avaliacoes WHERE \\"agendamentoId\\" IN (SELECT id FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'qa-%@teste.com'))`);
  sql(`DELETE FROM agendamentos WHERE \\"clienteId\\" IN (SELECT id FROM clientes WHERE email LIKE 'qa-%@teste.com') OR \\"servicoId\\" IN (SELECT id FROM servicos WHERE nome LIKE 'QA %') OR \\"profissionalId\\" IN (SELECT id FROM profissionais WHERE nome LIKE 'QA %')`);
  sql(`DELETE FROM clientes WHERE email ILIKE 'qa-%@teste.com'`);
  sql(`DELETE FROM servicos WHERE nome LIKE 'QA %' OR nome = '   '`);
  sql(`DELETE FROM produtos WHERE nome LIKE 'QA %'`);
  sql(`DELETE FROM profissionais WHERE nome LIKE 'QA %' OR nome = '   '`);
  sql(`DELETE FROM administradores WHERE login LIKE 'qa-%'`);
  sql(`DELETE FROM clientes WHERE nome = '   '`);
}

async function criarCliente(n, senha = 'cliente123') {
  const email = `qa-c${n}@teste.com`;
  await req('POST', '/publico/clientes', { corpo: { nome: `QA Cliente ${n}`, email, telefone: '44900000000', senha } });
  const l = await req('POST', '/auth/cliente/login', { corpo: { email, senha } });
  return { email, token: l.corpo?.accessToken, id: Number(sql(`SELECT id FROM clientes WHERE email='${email}'`)) };
}

(async () => {
  limpar();
  const adminLogin = await req('POST', '/auth/login', { corpo: { login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA } });
  const A = adminLogin.corpo.accessToken;
  const c1 = await criarCliente(1), c2 = await criarCliente(2);
  const servicos = (await req('GET', '/servicos', { token: A })).corpo;
  const profs = (await req('GET', '/profissionais', { token: A })).corpo;
  const corte = servicos.find((s) => s.nome === 'Corte');
  const gabriel = profs.find((p) => p.nome === 'Gabriel'), wesley = profs.find((p) => p.nome === 'Wesley');

  // ---------- 1. isolamento de autenticação ----------
  console.log('1) autenticação e isolamento');
  for (const [nome, r] of [
    ['admin em /meus-agendamentos', await req('GET', '/meus-agendamentos', { token: A })],
    ['admin em /meu-perfil', await req('GET', '/meu-perfil', { token: A })],
    ['cliente em /clientes', await req('GET', '/clientes', { token: c1.token })],
    ['cliente em /clientes/paginado', await req('GET', '/clientes/paginado', { token: c1.token })],
    ['cliente em /dashboard', await req('GET', '/dashboard', { token: c1.token })],
    ['cliente em /agendamentos', await req('GET', '/agendamentos', { token: c1.token })],
    ['cliente em /relatorios/clientes', await req('GET', '/relatorios/clientes', { token: c1.token })],
    ['cliente em /administradores', await req('GET', '/administradores', { token: c1.token })],
    ['cliente em /barbearia', await req('GET', '/barbearia', { token: c1.token })],
    ['sem token em /dashboard', await req('GET', '/dashboard')],
    ['token lixo', await req('GET', '/dashboard', { token: 'abc.def.ghi' })],
  ]) {
    if (r.status === 401) ok(); else achado('ALTA', 'Segurança', `Rota protegida respondeu ${r.status}: ${nome}`);
  }
  const partes = A.split('.');
  const adulterado = `${partes[0]}.${partes[1]}.${partes[2].slice(0, -3)}AAA`;
  (await req('GET', '/dashboard', { token: adulterado })).status === 401 ? ok() : achado('ALTA', 'Segurança', 'Token com assinatura adulterada foi aceito');
  const semAlg = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${partes[1]}.`;
  (await req('GET', '/dashboard', { token: semAlg })).status === 401 ? ok() : achado('ALTA', 'Segurança', 'Token alg=none foi aceito');
  const admins = (await req('GET', '/administradores', { token: A })).corpo;
  JSON.stringify(admins).includes('senha') ? achado('ALTA', 'Segurança', 'Lista de administradores expõe a senha/hash') : ok();
  JSON.stringify(adminLogin.corpo).includes('senha') ? achado('ALTA', 'Segurança', 'Resposta do login expõe a senha') : ok();
  const pub = await req('GET', '/publico/avaliacoes');
  JSON.stringify(pub.corpo).match(/email|telefone/) ? achado('ALTA', 'Privacidade', 'Avaliações públicas expõem e-mail/telefone') : ok();

  // ---------- 2. validações ----------
  console.log('2) validações de entrada');
  let r = await req('POST', '/clientes', { token: A, corpo: { nome: '   ', email: 'qa-esp@teste.com', telefone: '44900000000', senha: '123456' } });
  r.status === 201 ? achado('MÉDIA', 'Validação', 'Cliente com nome só de espaços é aceito (admin)', 'POST /clientes nome="   " -> 201') : ok();
  r = await req('POST', '/publico/clientes', { corpo: { nome: '   ', email: 'qa-esp2@teste.com', telefone: '44900000000', senha: '123456' } });
  r.status === 201 ? achado('MÉDIA', 'Validação', 'Cadastro público aceita nome só de espaços', 'o app bloqueia, a API não') : ok();
  r = await req('POST', '/servicos', { token: A, corpo: { nome: '   ', descricao: 'x', valor: 10, duracaoMinutos: 30 } });
  r.status === 201 ? achado('MÉDIA', 'Validação', 'Serviço com nome só de espaços é aceito') : ok();
  r = await req('POST', '/profissionais', { token: A, corpo: { nome: '   ', especialidade: 'x', descricao: 'x' } });
  r.status === 201 ? achado('MÉDIA', 'Validação', 'Profissional com nome só de espaços é aceito') : ok();
  r = await req('POST', '/servicos', { token: A, corpo: { nome: 'QA Valor Alto', descricao: 'x', valor: 100000000, duracaoMinutos: 30 } });
  r.status >= 500 ? achado('MÉDIA', 'Robustez', `Serviço com valor muito alto causa erro ${r.status} (deveria ser 400)`, JSON.stringify(r.corpo)) : ok();
  r = await req('POST', '/produtos', { token: A, corpo: { nome: 'QA Preco Alto', descricao: 'x', preco: 100000000 } });
  r.status >= 500 ? achado('MÉDIA', 'Robustez', `Produto com preço muito alto causa erro ${r.status}`) : ok();
  r = await req('POST', '/servicos', { token: A, corpo: { nome: 'QA Duracao Absurda', descricao: 'x', valor: 10, duracaoMinutos: 100000 } });
  r.status === 201 ? achado('BAIXA', 'Validação', 'Serviço com duração de 100000 minutos é aceito (nunca caberia na grade de horários)') : ok();
  r = await req('POST', '/publico/clientes', { corpo: { nome: 'QA Tel', email: 'qa-tel@teste.com', telefone: 'abc', senha: '123456' } });
  r.status === 201 ? achado('BAIXA', 'Validação', 'Telefone sem formato é aceito (ex.: "abc")') : ok();
  await req('POST', '/publico/clientes', { corpo: { nome: 'QA Caixa', email: 'qa-Caixa@Teste.com', telefone: '44900000000', senha: '123456' } });
  r = await req('POST', '/publico/clientes', { corpo: { nome: 'QA Caixa 2', email: 'qa-caixa@teste.com', telefone: '44900000000', senha: '123456' } });
  r.status === 201 ? achado('MÉDIA', 'Dados', 'E-mails que só mudam em maiúsculas/minúsculas viram contas diferentes', 'qa-Caixa@Teste.com e qa-caixa@teste.com coexistem') : ok();
  const longa = 'a'.repeat(80);
  r = await req('POST', '/publico/clientes', { corpo: { nome: 'QA Senha Longa', email: 'qa-longa@teste.com', telefone: '44900000000', senha: longa } });
  if (r.status === 201) {
    const l = await req('POST', '/auth/cliente/login', { corpo: { email: 'qa-longa@teste.com', senha: 'a'.repeat(72) + 'zzz' } });
    l.status === 200 ? achado('BAIXA', 'Segurança', 'Senhas com mais de 72 caracteres: só os 72 primeiros valem (limite do bcrypt)', 'login com final diferente entrou') : ok();
  } else ok();
  r = await req('POST', '/publico/clientes', { corpo: { nome: 'QA <script>alert(1)</script>', email: 'qa-xss@teste.com', telefone: '44900000000', senha: '123456' } });
  r.status === 201 ? ok() : ok();
  r = await req('POST', '/clientes', { token: A, bruto: '{"nome": ', cabecalhos: { 'Content-Type': 'application/json' } });
  r.status === 400 ? ok() : achado('BAIXA', 'Robustez', `JSON malformado respondeu ${r.status}`);
  r = await req('POST', '/clientes', { token: A, bruto: 'x'.repeat(2_000_000), cabecalhos: { 'Content-Type': 'application/json' } });
  r.status === 413 || r.status === 400 ? ok() : achado('BAIXA', 'Robustez', `Corpo de 2 MB respondeu ${r.status}`);
  r = await req('GET', '/clientes/99999999999', { token: A });
  r.status >= 500 ? achado('BAIXA', 'Robustez', `ID gigante causa erro ${r.status}`) : ok();
  r = await req('GET', '/rota-inexistente');
  r.status === 404 ? ok() : achado('BAIXA', 'Robustez', 'Rota inexistente não devolve 404');

  // ---------- 3. força bruta / abuso ----------
  console.log('3) abuso (sem limite de tentativas)');
  let tentativas = 0;
  for (let i = 0; i < 15; i++) { const x = await req('POST', '/auth/login', { corpo: { login: process.env.ADMIN_LOGIN, senha: 'errada' + i } }); if (x.status === 401) tentativas++; }
  const depois = await req('POST', '/auth/login', { corpo: { login: process.env.ADMIN_LOGIN, senha: process.env.ADMIN_SENHA } });
  if (tentativas === 15 && depois.status < 300) achado('ALTA', 'Segurança', 'Login do administrador sem limite de tentativas', '15 senhas erradas seguidas e a conta continua aceitando tentativas');
  let criados = 0;
  const lote = await Promise.all(Array.from({ length: 15 }, (_, i) => req('POST', '/publico/clientes', { corpo: { nome: `QA Spam ${i}`, email: `qa-spam${i}@teste.com`, telefone: '44900000000', senha: '123456' } })));
  criados = lote.filter((x) => x.status === 201).length;
  if (criados === 15) achado('MÉDIA', 'Segurança', 'Cadastro público sem limite: 15 contas criadas em sequência', 'abre caminho para spam de contas');
  const rec = await Promise.all(Array.from({ length: 10 }, () => req('POST', '/auth/cliente/esqueci-senha', { corpo: { email: c1.email } })));
  if (rec.every((x) => x.status === 201 || x.status === 200)) achado('MÉDIA', 'Segurança', 'Pedido de recuperação de senha sem limite (10 seguidos aceitos)', 'quando o e-mail real existir, dá para inundar a caixa de entrada de alguém');
  // tentativas de código de recuperação
  let bloqueou = false;
  for (let i = 0; i < 7; i++) { const x = await req('POST', '/auth/cliente/redefinir-senha', { corpo: { email: c1.email, codigo: '000000', novaSenha: 'novasenha1' } }); if (i >= 5 && x.status === 400) bloqueou = true; }
  bloqueou ? ok() : achado('BAIXA', 'Segurança', 'Código de recuperação aceita muitas tentativas');

  // ---------- 4. regras de agendamento ----------
  console.log('4) agendamentos: concorrência e regras');
  const seg = proximo(1, 21);
  const clientesCorrida = [];
  for (let i = 10; i < 15; i++) clientesCorrida.push(await criarCliente(i));
  const corrida = await Promise.all(clientesCorrida.map((c) => req('POST', '/meus-agendamentos', { token: c.token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg, '10:00') } })));
  const venceram = corrida.filter((x) => x.status === 201).length;
  venceram > 1
    ? achado('ALTA', 'Agendamento', `Corrida: ${venceram} clientes agendaram o MESMO horário ao mesmo tempo`, 'a checagem de horário livre não é atômica; precisa de trava no banco')
    : ok();

  // admin cria agendamento que invade o tempo de um agendamento do app (Corte 10:00-11:00)
  r = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: c2.id, servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(seg, '10:30') } });
  if (r.status === 201) achado('BAIXA', 'Agendamento', 'Painel permite agendamento que invade o tempo de outro atendimento do mesmo barbeiro', 'o app bloqueia (duração), o painel só bloqueia horário idêntico; encaixe pode ser intencional');
  const sobreposto = r.corpo?.id;

  // reativar cancelado em horário que já foi ocupado
  const base = await req('POST', '/meus-agendamentos', { token: c1.token, corpo: { servicoId: corte.id, profissionalId: wesley.id, dataHora: iso(seg, '15:00') } });
  if (base.status === 201) {
    await req('DELETE', `/meus-agendamentos/${base.corpo.id}`, { token: c1.token });
    const outro = await req('POST', '/meus-agendamentos', { token: c2.token, corpo: { servicoId: corte.id, profissionalId: wesley.id, dataHora: iso(seg, '15:00') } });
    const reativa = await req('PATCH', `/agendamentos/${base.corpo.id}`, { token: A, corpo: { status: 'CONFIRMADO' } });
    if (outro.status === 201 && reativa.status === 200) achado('ALTA', 'Agendamento', 'Reativar um agendamento cancelado cria horário duplicado', 'editar status CANCELADO -> CONFIRMADO não confere se o horário já foi ocupado por outro cliente');
    else ok();
  } else achado('MÉDIA', 'Teste', 'Não foi possível montar o cenário de reativação', JSON.stringify(base.corpo));

  // horizonte
  const longe = proximo(1, 800);
  r = await req('POST', '/meus-agendamentos', { token: c1.token, corpo: { servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(longe, '16:00') } });
  r.status === 201 ? achado('BAIXA', 'Agendamento', 'API aceita agendamento daqui a mais de 2 anos', 'o app limita a 60 dias, a API não') : ok();
  r = await req('GET', `/meus-agendamentos/horarios-disponiveis?servicoId=${corte.id}&profissionalId=${gabriel.id}&data=${proximo(1, 3000)}`, { token: c1.token });
  r.status === 200 ? achado('BAIXA', 'Agendamento', 'Consulta de horários aceita datas muito distantes') : ok();

  // admin cria no passado
  r = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: c2.id, servicoId: corte.id, profissionalId: gabriel.id, dataHora: '2020-01-06T13:00:00.000Z' } });
  r.status === 201 ? achado('BAIXA', 'Agendamento', 'Painel aceita agendamento no passado (útil para registrar atendimento esquecido, mas sem aviso)') : ok();

  // regra das 2h
  const em1h = new Date(Date.now() + 60 * 60000).toISOString();
  const em3h = new Date(Date.now() + 3 * 60 * 60000 + 7 * 60000).toISOString();
  const a1 = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: c1.id, servicoId: corte.id, profissionalId: wesley.id, dataHora: em1h } });
  const a3 = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: c1.id, servicoId: corte.id, profissionalId: gabriel.id, dataHora: em3h } });
  (await req('DELETE', `/meus-agendamentos/${a1.corpo.id}`, { token: c1.token })).status === 400 ? ok() : achado('ALTA', 'Regra de negócio', 'Cliente cancelou com menos de 2h de antecedência');
  (await req('DELETE', `/meus-agendamentos/${a3.corpo.id}`, { token: c1.token })).status === 200 ? ok() : achado('MÉDIA', 'Regra de negócio', 'Cliente não conseguiu cancelar com 3h de antecedência');
  // IDOR
  const alheio = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: c1.id, servicoId: corte.id, profissionalId: gabriel.id, dataHora: iso(proximo(2, 30), '11:00') } });
  const idor = await req('DELETE', `/meus-agendamentos/${alheio.corpo.id}`, { token: c2.token });
  [403, 404].includes(idor.status) ? ok() : achado('ALTA', 'Segurança', `Cliente conseguiu agir sobre agendamento de OUTRO cliente (${idor.status})`);
  const idorAv = await req('POST', '/minhas-avaliacoes', { token: c2.token, corpo: { agendamentoId: alheio.corpo.id, nota: 5, comentario: 'x' } });
  [403, 404, 409].includes(idorAv.status) ? ok() : achado('ALTA', 'Segurança', `Cliente avaliou agendamento de outro cliente (${idorAv.status})`);

  // avaliações
  // atendimento no passado: só se conclui o que já começou
  const paraAvaliar = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: c1.id, servicoId: corte.id, profissionalId: gabriel.id, dataHora: '2020-03-04T14:00:00.000Z' } });
  (await req('POST', '/minhas-avaliacoes', { token: c1.token, corpo: { agendamentoId: paraAvaliar.corpo.id, nota: 5, comentario: 'ótimo' } })).status === 409 ? ok() : achado('ALTA', 'Regra de negócio', 'Avaliou atendimento que ainda não foi concluído');
  await req('PATCH', `/agendamentos/${paraAvaliar.corpo.id}`, { token: A, corpo: { status: 'CONCLUIDO' } });
  for (const nota of [0, 6, 2.5]) {
    (await req('POST', '/minhas-avaliacoes', { token: c1.token, corpo: { agendamentoId: paraAvaliar.corpo.id, nota, comentario: 'ok' } })).status === 400 ? ok() : achado('MÉDIA', 'Validação', `Nota inválida (${nota}) foi aceita`);
  }
  (await req('POST', '/minhas-avaliacoes', { token: c1.token, corpo: { agendamentoId: paraAvaliar.corpo.id, nota: 4, comentario: '   ' } })).status === 400 ? ok() : achado('BAIXA', 'Validação', 'Comentário só de espaços é aceito na avaliação');
  const av = await req('POST', '/minhas-avaliacoes', { token: c1.token, corpo: { agendamentoId: paraAvaliar.corpo.id, nota: 4, comentario: 'Bom atendimento' } });
  av.status === 201 ? ok() : achado('ALTA', 'Regra de negócio', `Não conseguiu avaliar atendimento concluído (${av.status})`, JSON.stringify(av.corpo));
  (await req('POST', '/minhas-avaliacoes', { token: c1.token, corpo: { agendamentoId: paraAvaliar.corpo.id, nota: 4, comentario: 'de novo' } })).status === 409 ? ok() : achado('ALTA', 'Regra de negócio', 'Permitiu avaliar o mesmo atendimento duas vezes');
  // concluir antes da hora
  const futuro = await req('PATCH', `/agendamentos/${alheio.corpo.id}`, { token: A, corpo: { status: 'CONCLUIDO' } });
  futuro.status === 200 ? achado('MÉDIA', 'Regra de negócio', 'Painel conclui atendimento que ainda não aconteceu (data no futuro)', 'permite avaliação e faturamento de um atendimento futuro') : ok();

  // ---------- 5. exclusões e integridade ----------
  console.log('5) exclusões e integridade');
  const sv = await req('POST', '/servicos', { token: A, corpo: { nome: 'QA Servico Temp', descricao: 'x', valor: 10, duracaoMinutos: 30 } });
  const pf = await req('POST', '/profissionais', { token: A, corpo: { nome: 'QA Prof Temp', especialidade: 'x', descricao: 'x' } });
  const cl = await criarCliente(30);
  const hist = await req('POST', '/agendamentos', { token: A, corpo: { clienteId: cl.id, servicoId: sv.corpo.id, profissionalId: pf.corpo.id, dataHora: '2020-02-03T13:00:00.000Z' } });
  await req('PATCH', `/agendamentos/${hist.corpo.id}`, { token: A, corpo: { status: 'CONCLUIDO' } });
  for (const [nome, rota] of [['serviço', `/servicos/${sv.corpo.id}`], ['profissional', `/profissionais/${pf.corpo.id}`], ['cliente', `/clientes/${cl.id}`]]) {
    const d = await req('DELETE', rota, { token: A });
    if (d.status >= 500) achado('ALTA', 'Integridade', `Excluir ${nome} com atendimento no histórico causa erro ${d.status}`, 'a tela mostra erro genérico; deveria explicar que há histórico');
    else if (d.status === 200) achado('MÉDIA', 'Integridade', `Excluir ${nome} apagou também o histórico de atendimentos`, 'relatórios e faturamento perdem registros');
    else ok();
  }
  const qaAdmin = await req('POST', '/administradores', { token: A, corpo: { nome: 'QA Admin', login: 'qa-admin@teste.com', senha: 'qaadmin123' } });
  const qaLogin = await req('POST', '/auth/login', { corpo: { login: 'qa-admin@teste.com', senha: 'qaadmin123' } });
  if (qaAdmin.status === 201 && qaLogin.status < 300) {
    const self = await req('DELETE', `/administradores/${qaAdmin.corpo.id}`, { token: qaLogin.corpo.accessToken });
    if (self.status === 200) {
      const depoisToken = await req('GET', '/clientes', { token: qaLogin.corpo.accessToken });
      achado('MÉDIA', 'Segurança', 'Administrador pode excluir a própria conta', 'o painel não impede');
      if (depoisToken.status === 200) achado('ALTA', 'Segurança', 'Token de administrador excluído continua válido até expirar (8h)', 'conta removida ainda acessa tudo');
    } else ok();
  } else achado('BAIXA', 'Teste', 'Não foi possível criar o administrador de teste', JSON.stringify(qaAdmin.corpo));
  const total = (await req('GET', '/administradores', { token: A })).corpo.length;
  achado('INFO', 'Integridade', `Exclusão do último administrador: ${total} administrador(es) hoje`, 'verificar se o backend impede excluir o último (não executei para não perder o acesso)');

  // ---------- 6. infraestrutura ----------
  console.log('6) cabeçalhos e CORS');
  const cab = (await req('GET', '/publico/barbearia')).cab;
  cab.get('x-powered-by') ? achado('BAIXA', 'Segurança', 'Cabeçalho X-Powered-By revela que é Express') : ok();
  !cab.get('x-content-type-options') ? achado('BAIXA', 'Segurança', 'Sem cabeçalhos de segurança (helmet): X-Content-Type-Options, HSTS etc.') : ok();
  const cors = await fetch(`${API}/clientes`, { method: 'OPTIONS', headers: { Origin: 'http://site-malicioso.com', 'Access-Control-Request-Method': 'GET' } });
  const permitido = cors.headers.get('access-control-allow-origin');
  permitido === 'http://site-malicioso.com' || permitido === '*' ? achado('ALTA', 'Segurança', `CORS aceita qualquer origem (${permitido})`) : ok();

  // ---------- 7. consistência dashboard x relatório ----------
  console.log('7) consistência entre dashboard e relatório');
  const dash = (await req('GET', '/dashboard', { token: A })).corpo;
  const ini = new Date(`${somar(hoje, -29)}T00:00:00-03:00`).toISOString();
  const fim = new Date(new Date(`${somar(hoje, 1)}T00:00:00-03:00`).getTime() - 1).toISOString();
  const rel = await req('GET', `/relatorios/agendamentos?dataInicio=${encodeURIComponent(ini)}&dataFim=${encodeURIComponent(fim)}`, { token: A });
  const concluidosRel = rel.corpo?.porStatus?.find?.((s) => s.status === 'CONCLUIDO')?.total ?? rel.corpo?.totais?.CONCLUIDO ?? rel.corpo?.CONCLUIDO;
  if (concluidosRel === undefined) achado('INFO', 'Consistência', 'Não consegui ler o total de concluídos do relatório para comparar', JSON.stringify(rel.corpo).slice(0, 200));
  else concluidosRel === dash.passagem.ultimos30Dias.atendimentos ? ok() : achado('MÉDIA', 'Consistência', `Dashboard (${dash.passagem.ultimos30Dias.atendimentos}) e relatório (${concluidosRel}) divergem nos concluídos de 30 dias`);

  limpar();
  console.log(`\npassaram: ${passou} | achados: ${achados.length}`);
  for (const nivel of ['ALTA', 'MÉDIA', 'BAIXA', 'INFO']) {
    for (const a of achados.filter((x) => x.nivel === nivel)) console.log(`[${a.nivel}] (${a.area}) ${a.titulo}${a.detalhe ? ' — ' + a.detalhe : ''}`);
  }
})().catch((e) => { console.error('ERRO', e); try { limpar(); } catch {} process.exit(1); });
