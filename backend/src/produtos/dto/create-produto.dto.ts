import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

// Reflete os "Critérios" da US Cadastro de Produto:
// nome, descrição e preço são obrigatórios.
export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição do produto é obrigatória.' })
  @MaxLength(500)
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número com até 2 casas decimais.' })
  @IsPositive({ message: 'O preço do produto deve ser maior que zero.' })
  preco: number;
}
