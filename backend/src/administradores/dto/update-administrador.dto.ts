import { PartialType } from '@nestjs/mapped-types';
import { CreateAdministradorDto } from './create-administrador.dto';

// PartialType torna nome, login e senha opcionais — a US de Edição não exige
// trocar a senha a cada atualização; quando `senha` não é enviada, o service
// mantém o hash atual.
export class UpdateAdministradorDto extends PartialType(CreateAdministradorDto) {}
