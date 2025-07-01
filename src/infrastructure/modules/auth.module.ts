import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUserUseCase } from 'src/aplication/auth/register-user.usecase';
import { LoginUserUseCase } from 'src/aplication/auth/login-user.useCase';
import { MongoUserRepository } from '../repositories/mongo-user.repository';
import { EncrypterService } from '../services/encrypter.service';
import { TokenService } from '../services/token.service';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { ENCRYPTER } from 'src/domain/token/encrypter.token';
import { TOKEN_SERVICE } from 'src/domain/token/token-service.token';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';


@Module({
  controllers: [AuthController],
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    EncrypterService,
    TokenService,
    
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
      useClass: TokenService,
    },
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    ENCRYPTER,
    USER_REPOSITORY,
    TOKEN_SERVICE,
  ]
})
export class AuthModule {}
