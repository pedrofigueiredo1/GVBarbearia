-- CreateTable
CREATE TABLE "barbearia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "horarioFuncionamento" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbearia_pkey" PRIMARY KEY ("id")
);
