import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/auth/entities/user.entity';

import { TokenService } from 'src/infrastructure/services/token.service';
import { UserAlreadyExistsException } from 'src/domain/exceptions/user-already-exists.exception';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { Encrypter } from 'src/domain/auth/services/encrypter.service';
import { ENCRYPTER } from 'src/domain/token/encrypter.token';
import { TOKEN_SERVICE } from 'src/domain/token/token-service.token';
import { RegisterDto } from './dto/register.dto';

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
  ): Promise<{ user: RegisterDto; token: string }> {
   
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    console.log('🔍 Usuario ya existente?', existingUser);
    if (existingUser) {
      console.log('⚠️ Usuario ya existe');
      throw new UserAlreadyExistsException('El usuario ya existe');
    }

    // Encriptar la contraseña
    const hashedPassword = await this.encrypter.hashPassword(password);
    console.log('🔐 Password encriptado:', hashedPassword);
    const newUser = new User(
      '',               // id vacío; Mongoose lo va a generar
      email,            // email
      hashedPassword,   // password (hasheada)
      'vendedor',       // rol
      new Date(),       // createdAt
      new Date(),       // updatedAt
    );
    console.log('🧱 Entidad User construida:', newUser);
    // Guardar el nuevo usuario en la base de datos
    const savedUser = await this.userRepository.create(newUser);
    console.log('🧱 Usuario creado (entidad):', savedUser);
    if (!savedUser.id) {
      throw new Error('El usuario guardado no tiene un ID');
    }
    // Generar el JWT
    const token = this.tokenService.generateToken(savedUser.id);
    //Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
    //Type 'undefined' is not assignable to type 'string'.ts(2345)
 console.log('🔐 Token generado:', token);
    return { user: savedUser, token };
  }
}
