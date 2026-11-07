import { Module } from '@nestjs/common';
import { FotosModule } from '../fotos/fotos.module';
import { ProfissionaisController } from './profissionais.controller';
import { AdicionarProfissional } from './operacoes/adicionar-profissional';
import { ListarProfissionais } from './operacoes/listar-profissionais';
import { BuscarProfissional } from './operacoes/buscar-profissional';
import { EditarProfissional } from './operacoes/editar-profissional';
import { ExcluirProfissional } from './operacoes/excluir-profissional';

@Module({
  imports: [FotosModule],
  controllers: [ProfissionaisController],
  providers: [
    AdicionarProfissional,
    ListarProfissionais,
    BuscarProfissional,
    EditarProfissional,
    ExcluirProfissional,
  ],
  exports: [ListarProfissionais],
})
export class ProfissionaisModule {}
