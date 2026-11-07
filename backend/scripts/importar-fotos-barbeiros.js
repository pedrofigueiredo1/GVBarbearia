// Carrega no banco as fotos dos barbeiros que ainda não têm foto cadastrada,
// usando as imagens que já estavam no app (mobile/assets/images/prof-*.jpg).
//   npm run importar:fotos
// Cada foto passa pelo mesmo processamento do painel (600x800, JPEG) e só é
// colocada em quem ainda NÃO tem foto: nunca sobrescreve uma foto que o
// administrador tenha enviado. O backend precisa ter sido compilado antes
// (npm run build, ou ter rodado npm run start ao menos uma vez).
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const PASTA_FOTOS = path.join(__dirname, '..', '..', 'mobile', 'assets', 'images');
const FOTOS = { gabriel: 'prof-gabriel.jpg', bruno: 'prof-bruno.jpg', wesley: 'prof-wesley.jpg' };

const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

(async () => {
  const { ProcessarImagem } = require('../dist/src/fotos/operacoes/processar-imagem');
  const processar = new ProcessarImagem();
  const prisma = new PrismaClient();

  const profissionais = await prisma.profissional.findMany();
  for (const profissional of profissionais) {
    const primeiroNome = semAcento(profissional.nome.trim().split(/\s+/)[0]);
    const arquivo = FOTOS[primeiroNome];
    if (!arquivo) {
      console.log(`- ${profissional.nome}: sem foto de origem, ignorado.`);
      continue;
    }
    if (profissional.fotoAtualizadaEm) {
      console.log(`- ${profissional.nome}: já tem foto, mantida.`);
      continue;
    }
    const { conteudo, tipoMime } = await processar.executar(fs.readFileSync(path.join(PASTA_FOTOS, arquivo)));
    const agora = new Date();
    await prisma.$transaction([
      prisma.foto.create({ data: { profissionalId: profissional.id, conteudo, tipoMime, atualizadaEm: agora } }),
      prisma.profissional.update({ where: { id: profissional.id }, data: { fotoAtualizadaEm: agora } }),
    ]);
    console.log(`✔ ${profissional.nome}: foto carregada (${arquivo}).`);
  }
  await prisma.$disconnect();
})().catch((erro) => {
  console.error('Falhou:', erro.message);
  process.exit(1);
});
