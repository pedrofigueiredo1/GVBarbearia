import { PartialType } from '@nestjs/mapped-types';
import { CreateProfissionalDto } from './create-profissional.dto';

// PartialType torna todos os campos opcionais, mas mantém as mesmas
// validações do cadastro (@IsNotEmpty etc.) para quando um campo é enviado —
// atende a regra "os campos obrigatórios devem continuar válidos após a edição".
export class UpdateProfissionalDto extends PartialType(CreateProfissionalDto) {}
