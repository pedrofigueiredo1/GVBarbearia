import { PartialType } from '@nestjs/mapped-types';
import { CreateServicoDto } from './create-servico.dto';

// PartialType torna todos os campos opcionais, mas mantém as mesmas
// validações do cadastro para quando um campo é enviado — atende a regra
// "os campos obrigatórios devem continuar válidos após a edição".
export class UpdateServicoDto extends PartialType(CreateServicoDto) {}
