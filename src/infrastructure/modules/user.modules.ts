import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EncrypterService } from '../services/encrypter.service';
import { TokenService } from '../services/token.service';
import { MongoUserRepository } from '../repositories/mongo-user.repository';
import { RegisterUserUseCase } from 'src/aplication/auth/register-user.usecase';
import { UserSchema } from '../schema/user.schema';
import { AuthController } from '../controllers/auth.controller';
import { LoginUserUseCase } from 'src/aplication/auth/login-user.useCase';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { ENCRYPTER } from 'src/domain/token/encrypter.token';
import { TOKEN_SERVICE } from 'src/domain/token/token-service.token';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    TokenService,
    EncrypterService,
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: ENCRYPTER,
      useClass: EncrypterService,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: TokenService,  // Asegúrate de que TokenService esté registrado aquí
    },
  ],
  exports: [
    TokenService,  // Exporta TokenService después de haberlo registrado
  ],
})
export class UserModule {}
