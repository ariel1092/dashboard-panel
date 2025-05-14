import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from 'src/domain/clients/client-repository.interface';
import { Client } from 'src/domain/clients/entities/client.entity';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';


@Injectable()
export class FindClientsWithoutInteractionSinceUseCase {
  constructor(@Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository) {}

  async execute(date: Date): Promise<Client[]> {
    return this.clientRepository.findClientsWithoutInteractionSince(date);
  }
}
