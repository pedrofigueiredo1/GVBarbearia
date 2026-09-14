import { Body, Controller, Get, Put } from '@nestjs/common';
import { BarbeariaService } from './barbearia.service';
import { BarbeariaDto } from './dto/barbearia.dto';

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
