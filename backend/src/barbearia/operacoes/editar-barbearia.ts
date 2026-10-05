// ===== EDITAR BARBEARIA =====
// Ctrl+F "EDITAR BARBEARIA" para achar este bloco.
// US "Edição de Informações da Barbearia" (item 2.8 da documentação).
// Como não existe US de "Cadastro" separada, esta mesma operação cria o
// registro (upsert) na primeira vez que o admin salva o formulário.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BarbeariaDto } from '../dto/barbearia.dto';
import { ID_UNICO_BARBEARIA } from './id-unico';

@Injectable()
export class EditarBarbearia {
  constructor(private readonly prisma: PrismaService) {}

  executar(dto: BarbeariaDto) {
    return this.prisma.barbearia.upsert({
      where: { id: ID_UNICO_BARBEARIA },
      create: { id: ID_UNICO_BARBEARIA, ...dto },
      update: dto,
    });
  }
}
