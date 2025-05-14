// client-repository.token.ts
export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

import { CreateClientDto } from 'src/aplication/clients/DTO/create-client.dto';
import { Client } from './entities/client.entity';
import { UpdateClientDto } from 'src/aplication/clients/DTO/update-client.dto';
// client-repository.interface.ts

export interface ClientRepository {
  findById(id: string): Promise<Client | null>;
  findByPhone(phone: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  create(data: CreateClientDto): Promise<Client>;
  update(id: string, data: UpdateClientDto): Promise<Client>;
  disableClient(id: string): Promise<void>;
  exists(phone: string): Promise<boolean>;
  count(): Promise<number>;
  updateActiveClientsSince(date: Date): Promise<number>;
  updateInactiveClientsBefore(date: Date): Promise<number>;
  findClientsWithInteractionSince(date: Date): Promise<Client[]>;
  findClientsWithoutInteractionSince(date: Date): Promise<Client[]>;
}
