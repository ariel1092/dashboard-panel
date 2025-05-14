import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './infrastructure/modules/user.modules';
import { ClientController } from './infrastructure/controllers/clients.controller';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { ClientsModule } from './infrastructure/modules/clients.module';
import { AuthModule } from './infrastructure/modules/auth.module';

@Module({
  controllers: [ClientController, AuthController], 
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    UserModule,
    ClientsModule,
    AuthModule
  ],
})
export class AppModule {}

