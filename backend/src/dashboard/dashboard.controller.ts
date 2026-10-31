import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConsultarDashboard } from './operacoes/consultar-dashboard';

// Dashboard do painel: só para administradores autenticados.
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly consultarDashboard: ConsultarDashboard) {}

  // ===== CONSULTAR DASHBOARD =====
  @Get()
  consultar() {
    return this.consultarDashboard.executar();
  }
}
