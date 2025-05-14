import { ClientRepository } from "src/domain/clients/client-repository.interface";
import { CLIENT_REPOSITORY } from "src/domain/token/client.repository.token";
import {Injectable, Inject} from "@nestjs/common";

@Injectable()
export class CountClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository,
  ) {}

  async execute(): Promise<number> {
    return this.repository.count();
  }
}