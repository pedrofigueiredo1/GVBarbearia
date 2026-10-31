// Roda as verificações da API, uma depois da outra, e mostra o resumo.
// Uso: node test-api/executar-todos.js [--com-demo]
// Veja o README.md desta pasta para o que precisa estar ligado antes.
const { spawnSync } = require('child_process');
const path = require('path');

const API = process.env.API_URL ?? 'http://localhost:3000';
const env = {
  ...process.env,
  ADMIN_LOGIN: process.env.ADMIN_LOGIN ?? process.env.ADMIN_SEED_EMAIL ?? 'admin@gvbarbearia.com',
  ADMIN_SENHA: process.env.ADMIN_SENHA ?? process.env.ADMIN_SEED_PASSWORD ?? 'admin123',
};

const comDemo = process.argv.includes('--com-demo');
const scripts = [
  ['horarios.js', 'Grade de horários e agendamento do cliente'],
  ['concluido.js', 'Atendimento concluído não pode ser cancelado'],
  ['correcoes-do-qa.js', 'Correções do QA (corrida, reativação, validações...)'],
  ['dashboard.js', 'Dashboard'],
  ...(comDemo ? [['paginacao.js', 'Listagens paginadas (precisa dos dados de demonstração)']] : []),
];

(async () => {
  try {
    await fetch(`${API}/publico/barbearia`);
  } catch {
    console.error(`A API não respondeu em ${API}. Ligue o backend antes (com DESATIVAR_LIMITE_DE_REQUISICOES=true).`);
    process.exit(2);
  }

  let falhou = false;
  for (const [arquivo, descricao] of scripts) {
    const r = spawnSync('node', [path.join(__dirname, arquivo)], { env, encoding: 'utf8' });
    const saida = (r.stdout ?? '') + (r.stderr ?? '');
    const resumo = saida.trim().split('\n').filter((l) => /checagens ok/.test(l)).pop() ?? 'sem resumo';
    const passou = r.status === 0;
    if (!passou) {
      falhou = true;
      console.log(saida);
    }
    console.log(`${passou ? 'OK    ' : 'FALHOU'}  ${descricao} - ${resumo}`);
  }
  process.exit(falhou ? 1 : 0);
})();
