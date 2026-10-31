import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

// Maior valor de um Int do PostgreSQL (coluna `id`). Um número maior que isso
// estouraria o banco e viraria erro 500.
const MAIOR_ID = 2_147_483_647;

// Converte o parâmetro :id da URL em número, recusando com 400 o que não for um
// id possível (texto, negativo, zero ou grande demais). Substitui o pipe padrão
// do Nest para números inteiros, que aceitava valores enormes.
@Injectable()
export class IdPipe implements PipeTransform<string, number> {
  transform(valor: string) {
    if (!/^\d+$/.test(valor)) {
      throw new BadRequestException('O identificador informado é inválido.');
    }
    const id = Number(valor);
    if (id < 1 || id > MAIOR_ID) {
      throw new BadRequestException('O identificador informado é inválido.');
    }
    return id;
  }
}
