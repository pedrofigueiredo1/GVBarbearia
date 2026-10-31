// Servidor falso da Brevo, só para testar o envio de e-mail sem uma conta real.
const http = require('http');
let recebidos = [];
let modo = { status: 201 };
http.createServer((req, res) => {
  let corpo = '';
  req.on('data', (d) => (corpo += d));
  req.on('end', () => {
    if (req.url === '/__recebidos') { res.end(JSON.stringify(recebidos)); return; }
    if (req.url === '/__limpar') { recebidos = []; res.end('ok'); return; }
    if (req.url === '/__modo') { modo = JSON.parse(corpo); res.end('ok'); return; }
    recebidos.push({ url: req.url, metodo: req.method, cabecalhos: req.headers, corpo: corpo ? JSON.parse(corpo) : null });
    res.writeHead(modo.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(modo.status < 300 ? { messageId: '<fake@brevo>' } : { code: 'erro_simulado', message: 'erro simulado' }));
  });
}).listen(4010, () => console.log('mock da Brevo em :4010'));
