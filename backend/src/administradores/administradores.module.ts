import { Module } from '@nestjs/common';
import { AdministradoresController } from './administradores.controller';
import { AdicionarAdministrador } from './operacoes/adicionar-administrador';
import { ListarAdministradores } from './operacoes/listar-administradores';
import { BuscarAdministrador } from './operacoes/buscar-administrador';
import { EditarAdministrador } from './operacoes/editar-administrador';
import { ExcluirAdministrador } from './operacoes/excluir-administrador';

@Module({
  controllers: [AdministradoresController],
  providers: [
    AdicionarAdministrador,
    ListarAdministradores,
    BuscarAdministrador,
    EditarAdministrador,
    ExcluirAdministrador,
  ],
})
export class AdministradoresModule {}
