# Verificações da API

Scripts que chamam a API de verdade (backend e banco de desenvolvimento ligados)
e conferem as regras de negócio, a segurança e as validações. Cada script cria os
próprios dados de teste (nomes e e-mails começando com `qa-`/`QA `) e apaga tudo
no fim. Eles falam com o banco pelo container `gvbarbearia-postgres` (Docker) para
limpar esses dados, então só servem no ambiente de desenvolvimento.

## Antes de rodar

1. Docker com o banco no ar e o seed rodado (`npm run db:seed`), com os dados reais
   da barbearia cadastrados (serviço "Corte", profissionais "Gabriel" e "Wesley").
2. Backend no ar com o limite de tentativas desligado, porque os testes fazem muitos
   logins seguidos:

   ```bash
   DESATIVAR_LIMITE_DE_REQUISICOES=true npm run start
   ```

3. Se a senha do administrador não for a do seed, informe `ADMIN_LOGIN` e `ADMIN_SENHA`.

## Rodar tudo

```bash
node test-api/executar-todos.js            # horários, concluído, correções do QA, dashboard
node test-api/executar-todos.js --com-demo # inclui as listagens paginadas (precisa dos dados de demonstração)
```

## Scripts que precisam de preparo

- `dados-demo.js` cria clientes e ~200 agendamentos fictícios (`demo-dash-*`) para o
  dashboard e as listagens terem movimento. `node test-api/dados-demo.js limpar` remove.
- `limites-de-tentativas.js` testa o limite de tentativas por IP: o backend precisa estar
  **sem** `DESATIVAR_LIMITE_DE_REQUISICOES` (reinicie-o antes; o contador fica na memória).
- `email-recuperacao.js` testa o envio da recuperação de senha sem precisar de conta na
  Brevo, usando um servidor falso. Rode o servidor falso e o backend apontando para ele:

  ```bash
  node test-api/mock-brevo.js                       # terminal 1
  BREVO_API_KEY=chave-de-teste MAIL_REMETENTE_EMAIL=barbearia@teste.com \
  BREVO_API_URL=http://127.0.0.1:4010/v3/smtp/email \
  DESATIVAR_LIMITE_DE_REQUISICOES=true npm run start # terminal 2
  node test-api/email-recuperacao.js                 # terminal 3
  ```

- `qa-geral.js` é a varredura ampla de QA (segurança, validações, concorrência): em vez de
  passar/falhar, lista os achados por gravidade.
