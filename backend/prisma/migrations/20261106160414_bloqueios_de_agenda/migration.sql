-- CreateTable
CREATE TABLE "bloqueios_agenda" (
    "id" SERIAL NOT NULL,
    "profissionalId" INTEGER,
    "dataInicio" VARCHAR(10) NOT NULL,
    "dataFim" VARCHAR(10) NOT NULL,
    "motivo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bloqueios_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bloqueios_agenda_dataInicio_dataFim_idx" ON "bloqueios_agenda"("dataInicio", "dataFim");

-- AddForeignKey
ALTER TABLE "bloqueios_agenda" ADD CONSTRAINT "bloqueios_agenda_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
