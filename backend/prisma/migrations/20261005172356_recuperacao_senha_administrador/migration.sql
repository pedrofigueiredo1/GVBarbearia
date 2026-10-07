-- AlterTable
ALTER TABLE "administradores" ADD COLUMN     "tokenRecuperacaoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "tokenRecuperacaoHash" TEXT;
