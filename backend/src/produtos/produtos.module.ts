import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { AdicionarProduto } from './operacoes/adicionar-produto';
import { ListarProdutos } from './operacoes/listar-produtos';
import { BuscarProduto } from './operacoes/buscar-produto';
import { EditarProduto } from './operacoes/editar-produto';
import { ExcluirProduto } from './operacoes/excluir-produto';

@Module({
  controllers: [ProdutosController],
  providers: [
    AdicionarProduto,
    ListarProdutos,
    BuscarProduto,
    EditarProduto,
    ExcluirProduto,
  ],
})
export class ProdutosModule {}
