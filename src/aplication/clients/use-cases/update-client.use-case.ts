
import { Client } from 'src/domain/clients/entities/client.entity';
import { ClientRepository } from '../../../domain/clients/client-repository.interface';
import { UpdateClientDto } from '../DTO/update-client.dto';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository,
  ) {}

  async execute(id: string, data: UpdateClientDto): Promise<Client> {
    return this.repository.update(id, data);
  }
}