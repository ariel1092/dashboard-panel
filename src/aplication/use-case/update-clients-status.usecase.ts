import { Injectable } from '@nestjs/common';
import { ClientRepository } from 'src/domain/clients/client-repository.interface';
import { ClientLogRepository } from 'src/domain/repositories/client-log-repository.interface';


@Injectable()
export class UpdateClientsStatusUseCase {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly logRepo: ClientLogRepository,
  ) {}

  async execute(): Promise<void> {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

    const activeClients = await this.clientRepo.updateActiveClientsSince(THIRTY_DAYS_AGO);
    const inactiveClients = await this.clientRepo.updateInactiveClientsBefore(THIRTY_DAYS_AGO);

    await this.logRepo.createLog({
      message: 'Actualización mensual',
      activeUpdated: activeClients,
      inactiveUpdated: inactiveClients,
    });
  }
}
