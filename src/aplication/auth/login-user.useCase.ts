import { Inject, Injectable } from '@nestjs/common';


import { TokenService } from 'src/infrastructure/services/token.service';

import { InvalidCredentialsException } from 'src/domain/exceptions/invalid-credentials.exception';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { Encrypter } from 'src/domain/auth/services/encrypter.service';
import { ENCRYPTER } from 'src/domain/token/encrypter.token';
import { TOKEN_SERVICE } from 'src/domain/token/token-service.token';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ENCRYPTER)
    private readonly encrypterService: Encrypter,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService
  ) {}

  async execute(email: string, password: string): Promise<{ user: LoginDto; token: string }> {
    console.log('📩 Email recibido:', email);
    console.log('🔍 Buscando usuario por password:', password);
    const user = await this.userRepository.findByEmail(email);
 
   
    
    console.log('🔍 Usuario encontrado:', user);
 
  
    if (!user) {
      throw new InvalidCredentialsException();
    }
  console.log('🔐 Verificando contraseña...');
  
    const passwordMatch = await this.encrypterService.comparePassword(password, user.password);
    console.log('🔐 ¿Password coincide?:', passwordMatch);
  
    if (!passwordMatch) {
      throw new InvalidCredentialsException();
    }
    if (!user.id) {
      throw new Error('El ID del usuario es undefined. No se puede generar el token.');
    }
 
    const token = this.tokenService.generateToken(user.id);
    /**Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.ts(2345) */
  
  console.log('🎫 Token generado:', token);
  
    return { user, token };
  }
}  
