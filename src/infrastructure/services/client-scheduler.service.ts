import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientRepository } from 'src/domain/clients/client-repository.interface';
import { ClientLogRepository } from 'src/domain/repositories/client-log-repository.interface';


@Injectable()
export class ClientScheduler {
  private readonly logger = new Logger(ClientScheduler.name);

  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly logRepo: ClientLogRepository,
  ) {}

  @Cron('0 0 1 * *') // Cada día a la 1:00 AM
  async handleCron() {
    this.logger.log('Ejecutando tarea programada para actualizar estado de clientes...');
    await this.updateClientStatus();
  }

  async updateClientStatus() {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

    const toActivate = await this.clientRepo.findClientsWithInteractionSince(THIRTY_DAYS_AGO);
    const toDeactivate = await this.clientRepo.findClientsWithoutInteractionSince(THIRTY_DAYS_AGO);

    const activeCount = await this.clientRepo.updateActiveClientsSince(THIRTY_DAYS_AGO);
    const inactiveCount = await this.clientRepo.updateInactiveClientsBefore(THIRTY_DAYS_AGO);

    await this.logRepo.createLog({
      activeUpdated: activeCount,
      inactiveUpdated: inactiveCount,
      message: 'Actualización diaria ejecutada',
      activeClients: toActivate.map(c => ({ name: c.name, phone: c.phone })),
      inactiveClients: toDeactivate.map(c => ({ name: c.name, phone: c.phone })),
    });

    this.logger.log(`Clientes activos (${activeCount}):`);
    toActivate.forEach(c => this.logger.log(`- ${c.name} (${c.phone})`));

    this.logger.log(`Clientes inactivos (${inactiveCount}):`);
    toDeactivate.forEach(c => this.logger.log(`- ${c.name} (${c.phone})`));
  }
}
