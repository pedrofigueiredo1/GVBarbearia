import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';

// PartialType torna todos os campos opcionais, mas mantém as mesmas
// validações do cadastro para quando um campo é enviado — atende a regra
// "os campos obrigatórios devem continuar válidos após a edição".
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}
