
import { Client } from 'src/domain/clients/entities/client.entity';
import { ClientRepository } from '../../../domain/clients/client-repository.interface';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class GetAllClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository) {}

  async execute(): Promise<Client[]> {  
    return this.repository.findAll();
  }
}