import { Transform } from 'class-transformer';

// Tira os espaços do começo e do fim do texto antes de validar. Assim um nome
// só com espaços vira vazio e é recusado por @IsNotEmpty, e " Maria " é salvo
// como "Maria".
export const Aparar = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

// E-mail sem espaços e em minúsculas: "Maria@Email.com" e "maria@email.com"
// são a mesma conta (o banco diferencia maiúsculas de minúsculas).
export const EmailNormalizado = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
