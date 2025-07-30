import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsIn } from 'class-validator';
import { UserRole } from 'src/domain/auth/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña segura (mínimo 6 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos)',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo',
  })
  password: string;
  @ApiProperty({
    description: 'Rol del usuario',
    example: 'CLIENT',
    enum: ['ADMIN', 'CLIENT', 'OPERADOR'],
  })
  @IsString()
  @IsIn(['ADMIN', 'CLIENT', 'OPERADOR'], {
    message: 'El rol debe ser ADMIN, CLIENT u OPERADOR',
  })
  role: UserRole;
}
