import { Inject, Injectable } from '@nestjs/common';


import { TokenService } from 'src/infrastructure/services/token.service';

import { InvalidCredentialsException } from 'src/domain/exceptions/invalid-credentials.exception';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { Encrypter } from 'src/domain/auth/services/encrypter.service';
import { ENCRYPTER } from 'src/domain/token/encrypter.token';
import { TOKEN_SERVICE } from 'src/domain/token/token-service.token';

import { UserNotFoundException } from 'src/domain/exceptions/User-NotFound.Exception';
import { UserResponseDto } from './dto/user-response.dto';


@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ENCRYPTER)
    private readonly encrypterService: Encrypter,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService
  ) {}

  async execute( email: string, password: string): Promise<{ user: UserResponseDto; token: string }> {
  
    const user = await this.userRepository.findByEmail(email);

  
    if (!user) {
      console.log('⚠️ Usuario no encontrado');
      throw new UserNotFoundException();
    }

  
    const passwordMatch = await this.encrypterService.comparePassword(password, user.password);
  
    if (!passwordMatch) {
      console.log('⚠️ Credenciales inválidas');
      throw new InvalidCredentialsException();
    }
    if (!user.id) {
      throw new Error('El ID del usuario es undefined. No se puede generar el token.');
    }

const payload = {
  sub: user.id, 
  role: user.role,
};

  // Cambiás para pasar el payload completo
  const token = await this.tokenService.generateToken(payload);


  console.log('🎫 Token generado:', token);
   const { password: _, ...userWithoutPassword } = user;

    const userResponse: UserResponseDto = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
  
    };

    return { user: userResponse, token };
  }
}  
