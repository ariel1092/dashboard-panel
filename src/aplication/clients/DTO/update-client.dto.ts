import { IsOptional, IsString, IsPhoneNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClientDto {
  @IsOptional()
  @IsPhoneNumber('AR', { message: 'El número de teléfono no es válido para Argentina' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString({}, { message: 'La fecha de último contacto no es válida' })
  lastContact?: string; // usando string para fechas ISO

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de última interacción no es válida' })
  lastInteraction?: string;
}
