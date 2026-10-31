// Confere se o envio de e-mail pela Brevo está configurado direito, SEM enviar nada:
//   npm run verificar:email
// Para mandar também um e-mail de teste (a um endereço que você escolher):
//   npm run verificar:email -- --enviar voce@exemplo.com
//
// Lê o backend/.env, valida a chave na Brevo e confere se o remetente está
// verificado. Nunca mostra a chave inteira.
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const arquivoEnv = path.join(__dirname, '..', '.env');
const URL_BASE = 'https://api.brevo.com/v3';

const problemas = [];
let semPermissaoDeLeitura = false;
const ok = (texto) => console.log(`  ✔ ${texto}`);
const falha = (texto, dica) => {
  problemas.push(texto);
  console.log(`  ✘ ${texto}`);
  if (dica) console.log(`     → ${dica}`);
};

(async () => {
  console.log('Verificação do e-mail (Brevo)\n');

  if (!fs.existsSync(arquivoEnv)) {
    console.log(`  ✘ Não achei o arquivo ${arquivoEnv}`);
    process.exit(1);
  }
  const env = dotenv.parse(fs.readFileSync(arquivoEnv, 'utf8'));
  console.log(`.env lido (salvo em disco em ${fs.statSync(arquivoEnv).mtime.toLocaleString('pt-BR')})`);
  console.log('Importante: se você editou o .env no editor, salve o arquivo (Ctrl+S) antes de rodar isto.\n');

  // ---- variáveis
  const brutaChave = env.BREVO_API_KEY;
  const chave = (brutaChave ?? '').replace(/\s+/g, '');
  const remetente = (env.MAIL_REMETENTE_EMAIL ?? '').trim();

  if (brutaChave === undefined) {
    falha('BREVO_API_KEY não está no .env salvo.', 'Adicione a linha BREVO_API_KEY="..." e salve o arquivo.');
  } else {
    if (/\s/.test(brutaChave)) {
      console.log('  ! A chave tem quebra de linha ou espaço dentro das aspas (o sistema ignora isso, mas é melhor deixar tudo numa linha só).');
    }
    if (!chave.startsWith('xkeysib-')) {
      falha(`A chave não começa com "xkeysib-" (começa com "${chave.slice(0, 8)}...").`, 'Use uma chave de API (SMTP e API > Chaves de API), não a senha SMTP nem a chave v2.');
    } else {
      ok(`BREVO_API_KEY presente (${chave.slice(0, 12)}...${chave.slice(-4)}, ${chave.length} caracteres).`);
    }
  }
  if (!remetente) falha('MAIL_REMETENTE_EMAIL não está no .env salvo.', 'Use o e-mail que você verificou em Remetentes e IPs na Brevo.');
  else ok(`MAIL_REMETENTE_EMAIL = ${remetente}`);
  ok(`MAIL_REMETENTE_NOME = ${env.MAIL_REMETENTE_NOME ?? 'GV Barbearia (padrão)'}`);
  if (!env.ADMIN_URL) console.log('  ! ADMIN_URL não definida: o link de recuperação do painel usará http://localhost:3001 (certo só em desenvolvimento).');

  if (!chave || !remetente) return finalizar();

  const cabecalhos = { accept: 'application/json', 'api-key': chave };
  const chamar = async (caminho, opcoes = {}) => {
    try {
      const r = await fetch(`${URL_BASE}${caminho}`, { ...opcoes, headers: { ...cabecalhos, ...(opcoes.headers ?? {}) }, signal: AbortSignal.timeout(15000) });
      const texto = await r.text();
      let corpo = null;
      try { corpo = texto ? JSON.parse(texto) : null; } catch { corpo = texto; }
      return { status: r.status, corpo };
    } catch (e) {
      return { status: 0, corpo: e.message };
    }
  };

  // ---- chave
  console.log('\nConsultando a conta na Brevo...');
  const conta = await chamar('/account');
  if (conta.status === 200) {
    ok(`Chave válida. Conta: ${conta.corpo.email ?? '(sem e-mail)'}${conta.corpo.companyName ? ` — ${conta.corpo.companyName}` : ''}`);
    const planos = (conta.corpo.plan ?? []).map((p) => `${p.type}: ${p.credits ?? '?'} crédito(s)`).join(' | ');
    if (planos) console.log(`     Plano: ${planos}`);
  } else if (conta.status === 401) {
    falha('A Brevo recusou a chave (401): chave errada, revogada ou de outra conta.', 'Gere uma nova em SMTP e API > Chaves de API e cole no .env.');
  } else if (conta.status === 403) {
    semPermissaoDeLeitura = true;
    console.log('  ! A Brevo respondeu 403 (sem permissão) ao ler os dados da conta. Isso, sozinho, não prova que o envio falha:');
    console.log('     a chave pode ser restrita, ter IPs autorizados, ou a conta ainda estar em análise na Brevo. Vou testar os remetentes.');
  } else if (conta.status === 0) {
    falha(`Não consegui falar com a Brevo: ${conta.corpo}`, 'Confira a internet do computador.');
  } else {
    falha(`A Brevo respondeu ${conta.status}: ${JSON.stringify(conta.corpo).slice(0, 200)}`);
  }

  // ---- remetente
  // Um 403 na leitura da conta não impede o envio: a chave pode simplesmente não
  // ter permissão para consultar a conta. Por isso a conferência continua.
  if (conta.status === 200 || conta.status === 403) {
    console.log('\nConsultando os remetentes...');
    const lista = await chamar('/senders');
    if (lista.status === 200) {
      const remetentes = lista.corpo.senders ?? [];
      const meu = remetentes.find((s) => String(s.email).toLowerCase() === remetente.toLowerCase());
      if (!meu) {
        falha(`O remetente ${remetente} NÃO está cadastrado na Brevo.`, `Em Remetentes e IPs, adicione ${remetente} e confirme pelo e-mail que a Brevo enviar. Remetentes existentes: ${remetentes.map((s) => s.email).join(', ') || 'nenhum'}.`);
      } else if (!meu.active) {
        falha(`O remetente ${remetente} existe, mas ainda NÃO está verificado/ativo.`, 'Abra o e-mail de confirmação da Brevo (confira o spam) e clique no link, ou use "Verificar" em Remetentes e IPs.');
      } else {
        ok(`Remetente ${remetente} verificado e ativo.`);
      }
      if (/@(gmail|hotmail|outlook|yahoo|live)\./i.test(remetente)) {
        console.log('  ! Remetente de e-mail pessoal (Gmail/Outlook/Yahoo): a Brevo envia, mas esses provedores costumam mandar para o SPAM ou recusar, porque o domínio não autoriza a Brevo.');
        console.log('     Para a banca serve (peça para olhar a caixa de spam). Para uso real, o ideal é um e-mail de um domínio próprio autenticado na Brevo.');
      }
    } else if (lista.status === 403) {
      console.log('  ! Sem permissão para listar os remetentes (403): não dá para confirmar por aqui se o remetente está verificado.');
      console.log('     Confira em Remetentes e IPs na Brevo (o remetente precisa estar "Ativo") e faça o teste de envio abaixo.');
    } else {
      falha(`Não consegui listar os remetentes (HTTP ${lista.status}): ${JSON.stringify(lista.corpo).slice(0, 200)}`);
    }
  }

  // ---- envio de teste (só se pedido)
  const i = process.argv.indexOf('--enviar');
  if (i !== -1) {
    const destino = process.argv[i + 1];
    if (!destino || !destino.includes('@')) {
      falha('Informe o destinatário: npm run verificar:email -- --enviar voce@exemplo.com');
    } else if (problemas.length > 0) {
      console.log('\nE-mail de teste NÃO enviado: corrija os problemas acima primeiro.');
    } else {
      console.log(`\nEnviando e-mail de teste para ${destino}...`);
      const envio = await chamar('/smtp/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: env.MAIL_REMETENTE_NOME ?? 'GV Barbearia', email: remetente },
          to: [{ email: destino }],
          subject: 'Teste de e-mail - GV Barbearia',
          htmlContent: '<p>Este é um e-mail de teste do sistema da GV Barbearia. Se você recebeu, o envio pela Brevo está funcionando.</p>',
          textContent: 'Este é um e-mail de teste do sistema da GV Barbearia. Se você recebeu, o envio pela Brevo está funcionando.',
        }),
      });
      if (envio.status === 201 || envio.status === 200) ok(`Brevo aceitou o e-mail (id ${envio.corpo?.messageId}). Confira a caixa de entrada e o spam de ${destino}.`);
      else falha(`A Brevo recusou o envio (HTTP ${envio.status}): ${JSON.stringify(envio.corpo).slice(0, 300)}`);
    }
  }

  finalizar();

  function finalizar() {
    if (problemas.length > 0) {
      console.log(`\n${problemas.length} problema(s) para corrigir antes de usar.`);
    } else if (semPermissaoDeLeitura && process.argv.indexOf('--enviar') === -1) {
      console.log('\nA configuração está preenchida, mas a Brevo negou a leitura da conta (403): só o teste de envio mostra se funciona.');
      console.log('Rode: npm run verificar:email -- --enviar seu@email.com');
    } else {
      console.log('\nTudo certo na configuração.');
    }
    process.exit(problemas.length === 0 ? 0 : 1);
  }
})();
