import { ClientRepository } from "src/domain/clients/client-repository.interface";
import { CLIENT_REPOSITORY } from "src/domain/token/client.repository.token";
import { Injectable , Inject } from "@nestjs/common";

@Injectable()
export class ClientExistsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository,
  ) {}

  async execute(phone: string): Promise<boolean> {
    return this.repository.exists(phone);
  }
}