-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "codigoRecuperacaoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "codigoRecuperacaoHash" TEXT,
ADD COLUMN     "tentativasRecuperacao" INTEGER NOT NULL DEFAULT 0;
