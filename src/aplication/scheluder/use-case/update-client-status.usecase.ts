// src/aplication/scheduler/use-cases/update-client-status.usecase.ts

import { SchedulerServicePort } from "src/domain/scheluder/scheluder.service.port";



export class UpdateClientStatusUseCase {
  constructor(private readonly schedulerService: SchedulerServicePort) {}

  async execute(): Promise<void> {
    await this.schedulerService.updateClientStatus();
  }
}
