import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './infrastructure/modules/user.module';
import { ClientController } from './infrastructure/controllers/clients.controller';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { ClientsModule } from './infrastructure/modules/clients.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { TestController } from './infrastructure/controllers/test.controller';
import { WhatsappModule } from './infrastructure/modules/whatsapp.module';
import { LlamaIaModule } from './infrastructure/modules/llama-ia.module';
import { CampaignsModule } from './infrastructure/modules/campaings.module';
import { SchedulerModule } from './infrastructure/modules/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({

  controllers: [ClientController, AuthController,TestController], 
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
    AuthModule,
    WhatsappModule,
    LlamaIaModule,
    CampaignsModule,
    SchedulerModule,
  ],
})
export class AppModule {}

