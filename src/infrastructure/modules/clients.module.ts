import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../schema/client.schema';
import { ClientController } from '../controllers/clients.controller';
import { TestController } from '../controllers/test.controller';
import { CLIENT_LOG_REPOSITORY, CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';


// Casos de uso
import { CreateClientUseCase } from 'src/aplication/clients/use-cases/create-client.usecase';
import { UpdateClientUseCase } from 'src/aplication/clients/use-cases/update-client.use-case';
import { DisableClientUseCase } from 'src/aplication/clients/use-cases/disableClient-client.use-case';
import { FindClientByIdUseCase } from 'src/aplication/clients/use-cases/find-client-by-id.use-case';
import { FindClientByPhoneUseCase } from 'src/aplication/clients/use-cases/find-client-by-phone.use-case';
import { FindClientByEmailUseCase } from 'src/aplication/clients/use-cases/find-client-by-email.use-case';
import { ClientExistsUseCase } from 'src/aplication/clients/use-cases/client-exists.use-case';
import { CountClientsUseCase } from 'src/aplication/clients/use-cases/count-clients.use-case';
import { FindClientsWithInteractionSinceUseCase } from 'src/aplication/clients/use-cases/find-clients-with-interaction-since.usecase';
import { FindClientsWithoutInteractionSinceUseCase } from 'src/aplication/clients/use-cases/find-clients-without-interaction-since.usecase';
import { MongoClientRepository } from '../repositories/mongo-client.repository';
import { GetAllClientsUseCase } from 'src/aplication/clients/use-cases/get-all-clients.use-case';
import { UpdateClientStatusUseCase } from 'src/aplication/scheluder/use-case/update-client-status.usecase';
import { SendWhatsappMessageUseCase } from 'src/aplication/whatsapp/useCase/send-whatsapp-message.usecase';
import { GenerateMessageUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-message.usecase';
import { RunCampaignUseCase } from 'src/aplication/campaings/use-cases/run-campaign.usecase';
import { SchedulerModule } from './scheduler.module';
import { ClientLog, ClientLogSchema } from '../schema/client-log.schema';
import { MongoClientLogRepository } from '../repositories/mongo-client-log.repository';


@Module({
  controllers: [ClientController,TestController],
  imports: [
      MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema },
         { name: ClientLog.name, schema: ClientLogSchema },
      ],
        
      ),
      forwardRef(() => SchedulerModule),
  ],
  providers: [
    // Usar MongoClientRepository para la interfaz USER_REPOSITORY
    {
      provide: CLIENT_REPOSITORY,
      useClass: MongoClientRepository,
    },
    {
  provide: CLIENT_LOG_REPOSITORY,
  useClass: MongoClientLogRepository,
},
    // Casos de uso
    CreateClientUseCase,
    UpdateClientUseCase,
    UpdateClientStatusUseCase,
    DisableClientUseCase,
    FindClientByIdUseCase,
    FindClientByPhoneUseCase,
    FindClientByEmailUseCase,
    ClientExistsUseCase,
    CountClientsUseCase,
    FindClientsWithInteractionSinceUseCase,  
    FindClientsWithoutInteractionSinceUseCase,
    GetAllClientsUseCase,
    SendWhatsappMessageUseCase,
    GenerateMessageUseCase,
    RunCampaignUseCase
  ],
  exports: [
    CreateClientUseCase,
    UpdateClientUseCase,
    DisableClientUseCase,
    FindClientByIdUseCase,
    FindClientByPhoneUseCase,
    FindClientByEmailUseCase,
    ClientExistsUseCase,
    CountClientsUseCase,
    FindClientsWithInteractionSinceUseCase,
    FindClientsWithoutInteractionSinceUseCase,
    GetAllClientsUseCase,
    UpdateClientStatusUseCase,
    SendWhatsappMessageUseCase,
    GenerateMessageUseCase,
     RunCampaignUseCase,
     CLIENT_REPOSITORY,
     MongooseModule,
     CLIENT_LOG_REPOSITORY,

  ],
})
export class ClientsModule {}
