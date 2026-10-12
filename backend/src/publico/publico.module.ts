import { Module } from '@nestjs/common';
import { BarbeariaModule } from '../barbearia/barbearia.module';
import { ClientesModule } from '../clientes/clientes.module';
import { ProdutosModule } from '../produtos/produtos.module';
import { ProfissionaisModule } from '../profissionais/profissionais.module';
import { ServicosModule } from '../servicos/servicos.module';
import { ListarAvaliacoesPublicas } from './operacoes/listar-avaliacoes-publicas';
import { PublicoController } from './publico.controller';

@Module({
  imports: [
    BarbeariaModule,
    ClientesModule,
    ProdutosModule,
    ProfissionaisModule,
    ServicosModule,
  ],
  controllers: [PublicoController],
  providers: [ListarAvaliacoesPublicas],
})
export class PublicoModule {}
