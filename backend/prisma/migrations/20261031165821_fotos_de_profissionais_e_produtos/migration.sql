-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "fotoAtualizadaEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "profissionais" ADD COLUMN     "fotoAtualizadaEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "fotos" (
    "id" SERIAL NOT NULL,
    "conteudo" BYTEA NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "atualizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profissionalId" INTEGER,
    "produtoId" INTEGER,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fotos_profissionalId_key" ON "fotos"("profissionalId");

-- CreateIndex
CREATE UNIQUE INDEX "fotos_produtoId_key" ON "fotos"("produtoId");

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
