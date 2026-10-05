// ===== CADASTRAR PROFISSIONAL =====
// Ctrl+F "CADASTRAR PROFISSIONAL" para achar este bloco.
// US "Cadastro de Profissional" (item 2.13 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfissionalDto } from '../dto/create-profissional.dto';

@Injectable()
export class AdicionarProfissional {
  constructor(private readonly prisma: PrismaService) {}

  executar(dto: CreateProfissionalDto) {
    return this.prisma.profissional.create({ data: dto });
  }
}
