import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Resolve o "problema do ovo e da galinha": a US Cadastro de Administrador
// exige que só um administrador autenticado possa cadastrar outro, então
// precisa existir pelo menos um administrador no banco antes de qualquer
// login ser possível. Este script cria (ou atualiza a senha de) esse
// administrador inicial diretamente no banco, fora da API protegida.
async function main() {
  const login = process.env.ADMIN_SEED_EMAIL ?? 'admin@gvbarbearia.com';
  const senha = process.env.ADMIN_SEED_PASSWORD ?? 'admin123';
  const senhaHash = await bcrypt.hash(senha, 10);

  const administrador = await prisma.administrador.upsert({
    where: { login },
    update: { senha: senhaHash },
    create: { nome: 'Administrador', login, senha: senhaHash },
  });

  console.log(`Administrador inicial pronto: ${administrador.login}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
