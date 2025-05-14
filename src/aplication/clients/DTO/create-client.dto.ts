import { IsOptional, IsString, IsPhoneNumber, IsDateString } from 'class-validator';

export class CreateClientDto {
  @IsPhoneNumber('AR', { message: 'El número de teléfono debe ser válido para Argentina' })
  phone: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de último contacto no es válida' })
  lastContact?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de última interacción no es válida' })
  lastInteraction?: string;
}
