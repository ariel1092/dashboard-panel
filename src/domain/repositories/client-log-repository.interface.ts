// src/domain/clients/client-log.repository.ts
export interface ClientLogRepository {
    createLog(data: {
      activeUpdated: number;
      inactiveUpdated: number;
      message: string;
      activeClients?: { name: string; phone: string }[];
      inactiveClients?: { name: string; phone: string }[];
    }): Promise<void>;
  
    findAll(): Promise<any[]>;
  }
  