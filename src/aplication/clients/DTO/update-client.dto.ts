import { IsOptional, IsString, IsPhoneNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiPropertyOptional({
    description: 'Número de teléfono actualizado del cliente (Argentina)',
    example: '+5491167789900',
  })
  @IsOptional()
  @IsPhoneNumber('AR', { message: 'El número de teléfono no es válido para Argentina' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Nombre actualizado del cliente',
    example: 'Ana Gómez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha del último contacto (formato ISO 8601)',
    example: '2025-06-10T15:45:00.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDateString({}, { message: 'La fecha de último contacto no es válida' })
  lastContact?: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha de última interacción (formato ISO 8601)',
    example: '2025-06-18T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de última interacción no es válida' })
  lastInteraction?: string;
}
