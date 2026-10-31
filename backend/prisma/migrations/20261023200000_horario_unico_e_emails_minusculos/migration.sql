-- Um profissional não pode ter dois agendamentos ATIVOS no mesmo horário.
-- É a trava final contra duas pessoas agendando o mesmo horário ao mesmo tempo
-- (a checagem na aplicação sozinha não impede a corrida). Agendamentos
-- cancelados ficam de fora, porque liberam o horário. O Prisma não representa
-- índice parcial no schema.prisma, por isso ele existe só nesta migration.
CREATE UNIQUE INDEX "agendamentos_profissional_horario_ativo_key"
  ON "agendamentos" ("profissionalId", "dataHora")
  WHERE "status" <> 'CANCELADO';

-- E-mails passam a ser guardados sem espaços e em minúsculas (a aplicação
-- normaliza na entrada), para "Maria@x.com" e "maria@x.com" serem a mesma conta.
UPDATE "clientes" SET "email" = lower(btrim("email"));
UPDATE "administradores" SET "login" = lower(btrim("login"));
