import { Client } from "src/domain/clients/entities/client.entity";
import { Injectable, Inject } from '@nestjs/common';
import { CreateClientDto } from "../DTO/create-client.dto";
import { ClientRepository } from "src/domain/clients/client-repository.interface";
import { CLIENT_REPOSITORY } from "src/domain/token/client.repository.token";

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository
  ) {}

  async execute(dto: CreateClientDto): Promise<Client> {
    const existing = await this.repository.findByPhone(dto.phone);
    if (existing) return existing;
    return this.repository.create(dto);
  }
}
