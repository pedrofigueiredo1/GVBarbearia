// ===== CONSULTAR BARBEARIA =====
// Ctrl+F "CONSULTAR BARBEARIA" para achar este bloco.
// US "Consulta de Informações da Barbearia" (item 2.7 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ID_UNICO_BARBEARIA } from './id-unico';

@Injectable()
export class ConsultarBarbearia {
  constructor(private readonly prisma: PrismaService) {}

  // Retorna null quando ainda não há registro — a US Consulta trata isso
  // como um estado normal ("informa a falta de informações"), não um erro.
  executar() {
    return this.prisma.barbearia.findUnique({ where: { id: ID_UNICO_BARBEARIA } });
  }
}
