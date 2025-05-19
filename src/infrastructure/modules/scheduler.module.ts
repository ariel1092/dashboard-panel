// src/infrastructure/scheduler/scheduler.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UpdateClientStatusUseCase } from 'src/aplication/scheluder/use-case/update-client-status.usecase';
import { MongoClientLogRepository } from '../repositories/mongo-client-log.repository';
import { MongoClientRepository } from '../repositories/mongo-client.repository'; // Implementación de ClientRepository

import { CLIENT_LOG_REPOSITORY, CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';
import { ClientSchedulerService } from '../scheduler/client-scheduler.service';
import { ClientsModule } from './clients.module';
import { TestController } from '../controllers/test.controller';
import { ClientController } from '../controllers/clients.controller';





@Module({
  controllers: [ClientController,TestController],
  imports: [
    ScheduleModule.forRoot(),
 forwardRef(() => ClientsModule),
  ],
  providers: [
    ClientSchedulerService,

    // Implementaciones de las interfaces
    {
      provide: CLIENT_REPOSITORY,
      useClass: MongoClientRepository,
    },
    {
      provide: CLIENT_LOG_REPOSITORY,
      useClass: MongoClientLogRepository,
    },
    {
      provide: UpdateClientStatusUseCase,
      useFactory: (clientScheduler: ClientSchedulerService) => {
        return new UpdateClientStatusUseCase(clientScheduler);
      },
      inject: [ClientSchedulerService],
    },
  ],
  // Exportando correctamente los símbolos
   exports: [UpdateClientStatusUseCase, ClientSchedulerService,CLIENT_REPOSITORY, CLIENT_LOG_REPOSITORY],

})
export class SchedulerModule {}
