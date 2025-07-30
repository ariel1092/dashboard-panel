import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export enum Role {
  CLIENT = 'CLIENT',
  OPERADOR = 'OPERADOR',
  ADMIN = 'ADMIN',
}
export class CreateOperatorDto {
  @ApiProperty({
    description: 'Nombre del operador',
    example: 'Operador 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string; 


  @ApiProperty({
    description: 'Email del operador',
    example: 'operador@correo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña para el operador',
    example: 'operador123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Nombre del operador',
    example: 'nombre del operador',
  })


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
  @ApiPropertyOptional({
    description: 'Rol del usuario, será forzado a OPERADOR en backend',
    example: 'OPERADOR',
    enum: Role,
  })
  @IsEnum(Role)
  @IsOptional()
  role: Role = Role.OPERADOR;
}
