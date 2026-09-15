import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BarbeariaService } from './barbearia.service';
import { BarbeariaDto } from './dto/barbearia.dto';

// Nota: a US "Consulta de Informações da Barbearia" também existe para o
// cliente (sem exigir autenticação de administrador) — quando o app do
// cliente for construído, o GET provavelmente precisará de uma rota (ou
// exceção de guard) separada e pública para esse caso de uso.
@UseGuards(JwtAuthGuard)
@Controller('barbearia')
export class BarbeariaController {
  constructor(private readonly barbeariaService: BarbeariaService) {}

  @Get()
  findOne() {
    return this.barbeariaService.findOne();
  }

  @Put()
  upsert(@Body() dto: BarbeariaDto) {
    return this.barbeariaService.upsert(dto);
  }
}
