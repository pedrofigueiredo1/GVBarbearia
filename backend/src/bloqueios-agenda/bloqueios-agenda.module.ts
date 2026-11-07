import { Module } from '@nestjs/common';
import { BloqueiosAgendaController } from './bloqueios-agenda.controller';
import { AdicionarBloqueioAgenda } from './operacoes/adicionar-bloqueio-agenda';
import { ExcluirBloqueioAgenda } from './operacoes/excluir-bloqueio-agenda';
import { ListarBloqueiosAgenda } from './operacoes/listar-bloqueios-agenda';

@Module({
  controllers: [BloqueiosAgendaController],
  providers: [
    AdicionarBloqueioAgenda,
    ListarBloqueiosAgenda,
    ExcluirBloqueioAgenda,
  ],
})
export class BloqueiosAgendaModule {}
