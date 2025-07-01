// src/aplication/auth/dto/user-response.dto.ts

import { UserRole } from 'src/domain/auth/entities/user.entity';

export class UserResponseDto {
  id: string ;
  email: string;
  role: UserRole;
}
