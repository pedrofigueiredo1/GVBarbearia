// ===== CADASTRAR SERVICO =====
// Ctrl+F "CADASTRAR SERVICO" para achar este bloco.
// US "Cadastro de Serviço" (item 2.9 da documentação).
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicoDto } from '../dto/create-servico.dto';

@Injectable()
export class AdicionarServico {
  constructor(private readonly prisma: PrismaService) {}

  executar(dto: CreateServicoDto) {
    return this.prisma.servico.create({ data: dto });
  }
}
