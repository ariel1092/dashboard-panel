import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOperatorDto {
  @ApiProperty({
    description: 'Email del operador',
    example: 'carla.fernandez@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña para el operador',
    example: 'MiPasswordSegura123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Nombre del operador',
    example: 'Carla Fernández',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Indica si el operador está disponible para recibir chats',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;

   @ApiPropertyOptional({
    description: 'Rol del usuario, será forzado a OPERADOR en backend',
    example: 'OPERADOR',
  })
  @IsOptional()
  @IsString()
  role: string = 'OPERADOR';
}
