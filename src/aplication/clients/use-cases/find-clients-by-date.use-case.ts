// src/aplication/clients/use-cases/find-clients-by-date.use-case.ts

import { Inject } from '@nestjs/common';
import { ClientRepository } from 'src/domain/clients/client-repository.interface';

import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';

export class FindClientsByDateUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(limit: number, date: Date) {
    return this.clientRepository.findClientsByDate(limit, date);
  }
}
