import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BarbeariaDto } from './dto/barbearia.dto';

// Id fixo do registro único de configuração da barbearia — não existe US de
// "Cadastro", então o mesmo id é usado tanto para criar (na primeira edição)
// quanto para atualizar as informações institucionais.
const ID_UNICO = 1;

@Injectable()
export class BarbeariaService {
  constructor(private readonly prisma: PrismaService) {}

  // Retorna null quando ainda não há registro — a US Consulta trata isso
  // como um estado normal ("informa a falta de informações"), não um erro.
  findOne() {
    return this.prisma.barbearia.findUnique({ where: { id: ID_UNICO } });
  }

  upsert(dto: BarbeariaDto) {
    return this.prisma.barbearia.upsert({
      where: { id: ID_UNICO },
      create: { id: ID_UNICO, ...dto },
      update: dto,
    });
  }
}
