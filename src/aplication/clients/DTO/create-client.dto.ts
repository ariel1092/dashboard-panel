import { IsOptional, IsString, IsPhoneNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Número de teléfono del cliente (Argentina)',
    example: '+5491133345566',
  })
  @IsPhoneNumber('AR', { message: 'El número de teléfono debe ser válido para Argentina' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Fecha del último contacto con el cliente (ISO 8601)',
    example: '2025-06-15T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de último contacto no es válida' })
  lastContact?: string;

  @ApiPropertyOptional({
    description: 'Fecha de la última interacción con el cliente (ISO 8601)',
    example: '2025-06-18T11:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de última interacción no es válida' })
  lastInteraction?: string;
}
