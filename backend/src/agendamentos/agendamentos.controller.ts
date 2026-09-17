import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@UseGuards(JwtAuthGuard)
@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  create(@Body() dto: CreateAgendamentoDto) {
    return this.agendamentosService.create(dto);
  }

  @Get()
  findAll() {
    return this.agendamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendamentoDto,
  ) {
    return this.agendamentosService.update(id, dto);
  }

  // Mantido como DELETE por consistência de rota com os demais módulos,
  // mas o service trata a operação como cancelamento (ver
  // agendamentos.service.ts e o comentário em schema.prisma).
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.cancelar(id);
  }
}
