import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BarbeariaDto } from './dto/barbearia.dto';
import { ConsultarBarbearia } from './operacoes/consultar-barbearia';
import { EditarBarbearia } from './operacoes/editar-barbearia';

// Nota: a US "Consulta de Informações da Barbearia" também existe para o
// cliente (sem exigir autenticação de administrador) — quando o app do
// cliente for construído, o GET provavelmente precisará de uma rota (ou
// exceção de guard) separada e pública para esse caso de uso.
@UseGuards(JwtAuthGuard)
@Controller('barbearia')
export class BarbeariaController {
  constructor(
    private readonly consultarBarbearia: ConsultarBarbearia,
    private readonly editarBarbearia: EditarBarbearia,
  ) {}

  // ===== CONSULTAR BARBEARIA =====
  @Get()
  findOne() {
    return this.consultarBarbearia.executar();
  }

  // ===== EDITAR BARBEARIA =====
  @Put()
  upsert(@Body() dto: BarbeariaDto) {
    return this.editarBarbearia.executar(dto);
  }
}
