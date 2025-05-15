import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../schema/client.schema';


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
import { ClientController } from '../controllers/clients.controller';
import { GetAllClientsUseCase } from 'src/aplication/clients/use-cases/get-all-clients.use-case';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';


@Module({
  controllers: [ClientController],
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
  providers: [
    // Usar MongoClientRepository para la interfaz USER_REPOSITORY
    {
      provide: CLIENT_REPOSITORY,
      useClass: MongoClientRepository,
    },
    // Casos de uso
    CreateClientUseCase,
    UpdateClientUseCase,
    DisableClientUseCase,
    FindClientByIdUseCase,
    FindClientByPhoneUseCase,
    FindClientByEmailUseCase,
    ClientExistsUseCase,
    CountClientsUseCase,
    FindClientsWithInteractionSinceUseCase,  // Este debe inyectar MongoClientRepository
    FindClientsWithoutInteractionSinceUseCase,
    GetAllClientsUseCase
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
    GetAllClientsUseCase
  ],
})
export class ClientsModule {}
