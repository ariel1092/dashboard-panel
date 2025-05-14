import { ClientRepository } from 'src/domain/clients/client-repository.interface';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';
import { Injectable, Inject } from '@nestjs/common';


@Injectable()
export class DisableClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly repository: ClientRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const client = await this.repository.findById(id);
    if (!client) {
      throw new Error('Cliente no encontrado');
    }
    if (!client.active) {
      throw new Error('El cliente ya está desactivado');
    }
    await this.repository.disableClient(id);
  }
}