import { Module } from '@nestjs/common';
import { FotosModule } from '../fotos/fotos.module';
import { ProdutosController } from './produtos.controller';
import { AdicionarProduto } from './operacoes/adicionar-produto';
import { ListarProdutos } from './operacoes/listar-produtos';
import { BuscarProduto } from './operacoes/buscar-produto';
import { EditarProduto } from './operacoes/editar-produto';
import { ExcluirProduto } from './operacoes/excluir-produto';

@Module({
  imports: [FotosModule],
  controllers: [ProdutosController],
  providers: [
    AdicionarProduto,
    ListarProdutos,
    BuscarProduto,
    EditarProduto,
    ExcluirProduto,
  ],
  exports: [ListarProdutos],
})
export class ProdutosModule {}
