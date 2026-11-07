# GV Barbearia — Sistema de Agendamentos

Sistema de agendamentos para a **GV Barbearia** (Umuarama/PR): um aplicativo para os clientes marcarem
horários e um painel administrativo web para a barbearia gerenciar o negócio.

Trabalho de Conclusão de Curso — Tecnologia em Sistemas para Internet, Faculdade Alfa Umuarama (UniALFA).
Autor: Pedro Henrique de Figueiredo.

## O que o sistema faz

**Aplicativo do cliente (mobile)**

- Cadastro, login e recuperação de senha por código enviado ao e-mail.
- Consulta de serviços (com destaque para o mais agendado dos últimos 7 dias), profissionais, produtos,
  avaliações e informações da barbearia.
- Agendamento em três passos: profissional, data (calendário) e horário livre.
- "Meus agendamentos": próximos horários, cancelamento (até 2 horas antes) e avaliação dos atendimentos concluídos.
- Perfil: edição de dados e troca de senha.

**Painel administrativo (web)**

- Dashboard: passagem de clientes (hoje, ontem, 7 e 30 dias, mês), faturamento, ticket médio, cancelamentos,
  pendentes de confirmação, agenda de hoje e rankings.
- Agenda em calendário (dia e semana) com o horário de funcionamento, lista de agendamentos com filtros e
  cadastro, edição, confirmação, conclusão e cancelamento de agendamentos.
- Bloqueio de agenda por feriado ou ausência de barbeiro: o cliente não consegue agendar nesses dias.
- Cadastros com busca, ordenação e paginação: serviços, profissionais e produtos (com foto), clientes,
  administradores e informações da barbearia; moderação de avaliações.
- Cinco relatórios (agendamentos, serviços mais agendados, atendimento por profissional, clientes e avaliações),
  exportáveis em PDF.

### Regras de agendamento

- Horário de funcionamento: segunda a sexta das 9h às 13h e das 15h às 21h; sábado das 8h às 13h e das 14h às
  18h; domingo fechado. Os horários seguem uma grade de 30 minutos e o serviço precisa terminar antes do fim do
  período (almoço ou fechamento).
- Não se agenda em data que já passou (o dia de hoje vale) nem em dia bloqueado pelo administrador.
- O mesmo profissional não pode ter dois agendamentos ativos no mesmo horário (o banco de dados garante isso).
- O cliente agenda com até 60 dias de antecedência; no painel não há esse limite.
- Agendamento feito pelo app nasce **Pendente** e a barbearia o **confirma** pelo painel; feito pelo
  administrador nasce **Confirmado**. Depois vem **Concluído** (libera a avaliação) ou **Cancelado**.
- Os lembretes de horário aos clientes são enviados manualmente pela barbearia, por WhatsApp, fora do sistema.

## Estrutura

```
backend/   API REST — NestJS 10, Prisma 6 e PostgreSQL 16
admin/     Painel administrativo — Next.js 15, React 19 e Tailwind CSS 4
mobile/    Aplicativo do cliente — Expo SDK 58 (React Native), Expo Router
docs/      Documentação do TCC: relatório, wireframes e diagramas (classes, DER e casos de uso)
```

Detalhes da API: o backend organiza cada operação em um arquivo (`src/<módulo>/operacoes/`), valida os dados
com `class-validator`, autentica administrador e cliente por JWT separados e limita as tentativas de login
e de recuperação de senha. As regras de negócio ficam sempre no backend; o painel e o app apenas as refletem.

## Como rodar no seu computador

Pré-requisitos: **Node.js 20+**, **Docker** (para o PostgreSQL) e, para o app, o aplicativo **Expo Go**
(SDK 58) no celular ou um emulador Android.

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe o PostgreSQL 16 em `localhost:5433` (usuário, senha e banco `gvbarbearia`).

### 2. Backend (porta 3000)

```bash
cd backend
cp .env.example .env          # preencha JWT_SECRET, CLIENTE_JWT_SECRET e ADMIN_SEED_PASSWORD
npm install
npx prisma migrate deploy     # cria as tabelas
npx prisma generate
npm run db:seed               # cria o administrador inicial (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD)
npm run start:dev
```

Gere segredos aleatórios com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
O seed cria só o administrador: serviços, profissionais, produtos e os dados da barbearia são cadastrados
pelo painel. O e-mail de recuperação de senha usa a Brevo (`BREVO_API_KEY`); sem a chave, o conteúdo do
e-mail aparece no console do backend, o que basta para testar.

### 3. Painel administrativo (porta 3001)

```bash
cd admin
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev
```

Abra <http://localhost:3001> e entre com o e-mail e a senha do administrador criado no seed.

### 4. Aplicativo do cliente

```bash
cd mobile
cp .env.example .env          # EXPO_PUBLIC_API_URL: veja as opções abaixo
npm install
npx expo start
```

`EXPO_PUBLIC_API_URL` depende de onde o app roda:

| Onde o app roda | Valor |
| --- | --- |
| Navegador (`npm run web`) | `http://localhost:3000` |
| Emulador Android | `http://10.0.2.2:3000` |
| Celular com Expo Go | `http://<IP-do-computador-na-rede>:3000` (celular e computador na mesma rede) |

Reinicie o `npx expo start` depois de mudar o `.env`. Para testar o app no navegador, o backend precisa
liberar a origem do Metro em `CORS_ORIGINS` (já vem no `.env.example`).

## Testes da API

A pasta `backend/test-api` tem scripts que chamam a API de verdade e conferem regras de negócio, segurança e
validações (horários, bloqueios de agenda, datas passadas, ranking, fotos, dashboard e correções do QA).

```bash
cd backend
DESATIVAR_LIMITE_DE_REQUISICOES=true npm run start      # backend sem o limite de logins, só para os testes
ADMIN_LOGIN=<e-mail> ADMIN_SENHA=<senha> npm run test:api
```

Eles apagam os próprios dados de teste no fim e só servem no ambiente de desenvolvimento. Veja
`backend/test-api/README.md` para os pré-requisitos de cada script.

## Documentação

A pasta [`docs/`](docs) reúne o relatório do projeto (`Documentação GV Barbearia.docx`, com as user stories,
regras de negócio e testes de aceitação), os wireframes (capturas de todas as telas do sistema) e os diagramas
de classes, entidade-relacionamento e casos de uso em PDF.
