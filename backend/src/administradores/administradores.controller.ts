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
import { AdministradoresService } from './administradores.service';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { UpdateAdministradorDto } from './dto/update-administrador.dto';

// Todas as rotas exigem administrador autenticado, conforme as Regras de
// Negócio de cada US (Cadastro/Consulta/Edição/Exclusão de Administrador).
@UseGuards(JwtAuthGuard)
@Controller('administradores')
export class AdministradoresController {
  constructor(private readonly administradoresService: AdministradoresService) {}

  @Post()
  create(@Body() dto: CreateAdministradorDto) {
    return this.administradoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.administradoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.administradoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdministradorDto,
  ) {
    return this.administradoresService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.administradoresService.remove(id);
  }
}
