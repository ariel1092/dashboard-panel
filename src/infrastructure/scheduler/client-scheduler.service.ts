// src/infrastructure/scheduler/client-scheduler.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ClientRepository } from '../../domain/clients/client-repository.interface';
import { ClientLogRepository } from '../../domain/repositories/client-log-repository.interface';
import { SchedulerServicePort } from 'src/domain/scheluder/scheluder.service.port';
import { CLIENT_LOG_REPOSITORY, CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';

@Injectable()
export class ClientSchedulerService implements SchedulerServicePort {
  private readonly logger = new Logger(ClientSchedulerService.name);

  constructor(
    @Inject(CLIENT_REPOSITORY) 
    private readonly clientRepo: ClientRepository,
     @Inject(CLIENT_LOG_REPOSITORY) 
    private readonly logRepo: ClientLogRepository,
  ) {}

  @Cron('0 0 1 * *') // Cada día a la 1:00 AM
  async handleCron() {
    this.logger.log('⏰ Ejecutando tarea programada para actualizar estado de clientes...');
    await this.updateClientStatus();
  }

  async updateClientStatus(): Promise<void> {
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
