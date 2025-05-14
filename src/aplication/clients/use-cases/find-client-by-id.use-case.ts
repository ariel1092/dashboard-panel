import { ClientRepository } from "src/domain/clients/client-repository.interface";
import { Client } from "src/domain/clients/entities/client.entity";
import { CLIENT_REPOSITORY } from "src/domain/token/client.repository.token";
import { Injectable, Inject } from "@nestjs/common";



Injectable()
export class FindClientByIdUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository,
  ) {}

  async execute(id: string): Promise<Client | null> {
    return this.repository.findById(id);
  }
}