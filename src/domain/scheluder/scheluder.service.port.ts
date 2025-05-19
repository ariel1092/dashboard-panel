// src/domain/scheduler/scheduler.service.port.ts

export interface SchedulerServicePort {
  updateClientStatus(): Promise<void>;
}
