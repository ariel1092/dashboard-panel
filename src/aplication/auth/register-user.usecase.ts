import { Inject, Injectable } from '@nestjs/common';
import { User, UserRole } from 'src/domain/auth/entities/user.entity';

import { TokenService } from 'src/infrastructure/services/token.service';
import { UserAlreadyExistsException } from 'src/domain/exceptions/user-already-exists.exception';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { Encrypter } from 'src/domain/auth/services/encrypter.service';
import { ENCRYPTER } from 'src/domain/token/encrypter.token';
import { TOKEN_SERVICE } from 'src/domain/token/token-service.token';

import { UserResponseDto } from './dto/user-response.dto';



@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(ENCRYPTER) private readonly encrypter: Encrypter,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async execute(
    email: string,
    password: string,
    role: UserRole,
   
  ): Promise<{
    id: string | null | undefined; user: UserResponseDto; token: string 
}> {
   
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      console.log('⚠️ Usuario ya existe');
      throw new UserAlreadyExistsException('El usuario ya existe');
    }

    // Encriptar la contraseña
    const hashedPassword = await this.encrypter.hashPassword(password);
    const newUser = new User(
      '',        // id (se generará al guardar en la base de datos)
      email,            // email
      hashedPassword,   // password (hasheada)
      role,   // rol
           // updatedAt
    );
  
    // Guardar el nuevo usuario en la base de datos
    const savedUser = await this.userRepository.create(newUser);

    if (!savedUser.id) {
      throw new Error('El usuario guardado no tiene un ID');
    }
    // Generar el JWT
const token = this.tokenService.generateToken({
  id: savedUser.id,
  role: savedUser.role,
});
     const { password: _, ...userWithoutPassword } = savedUser;
 console.log('✅ Usuario registrado exitosamente');
     return {
       user: userWithoutPassword,
       token,
       id: savedUser.id,
      };
     
  }
}
