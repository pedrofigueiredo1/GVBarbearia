import { Module } from '@nestjs/common';
import { ConsultarFoto } from './operacoes/consultar-foto';
import { ProcessarImagem } from './operacoes/processar-imagem';
import { RemoverFoto } from './operacoes/remover-foto';
import { SalvarFoto } from './operacoes/salvar-foto';

@Module({
  providers: [ProcessarImagem, SalvarFoto, RemoverFoto, ConsultarFoto],
  exports: [SalvarFoto, RemoverFoto, ConsultarFoto],
})
export class FotosModule {}
