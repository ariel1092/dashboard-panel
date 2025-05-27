import { UpdateClientDto } from "src/aplication/clients/DTO/update-client.dto";
import { CreateClientDto } from "src/aplication/clients/DTO/create-client.dto";
import { ClientRepository } from "src/domain/clients/client-repository.interface";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, Logger } from '@nestjs/common';
import { Client } from "src/domain/clients/entities/client.entity";
import { ClientDocument, Client as ClientSchema } from "../schema/client.schema";

@Injectable()
export class MongoClientRepository implements ClientRepository {
  private readonly logger = new Logger(MongoClientRepository.name);

  constructor(
    @InjectModel(ClientSchema.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  private mapToDomain(doc: ClientDocument): Client {
    return doc.toDomain();
  }

  async findById(id: string): Promise<Client | null> {
    this.logger.debug(`→ [findById] Input id: "${id}"`);
    try {
      const doc = await this.clientModel.findById(id).exec();
      this.logger.debug(`→ [findById] Raw Mongo result: ${doc ? JSON.stringify(doc.toObject()) : 'null'}`);
      if (!doc) {
        this.logger.debug('→ [findById] No client found, returning null');
        return null;
      }
      const domain = this.mapToDomain(doc);
      this.logger.debug(`→ [findById] Mapped to domain: ${JSON.stringify(domain)}`);
      return domain;
    } catch (error) {
      this.logger.error(`Error in findById(${id}): ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

// src/infrastructure/mongodb/repositories/mongo-client.repository.ts

async findByPhone(phone: string): Promise<Client | null> {
  this.logger.debug(`→ [findByPhone] Input phone: "${phone}"`);
  try {
    // Normalizar el teléfono de la misma manera que lo hacemos al guardar
    const normalized = phone ? phone.replace(/\D/g, '').trim() : '';
    this.logger.debug(`→ [findByPhone] Normalized phone: "${normalized}"`);
    
    // Buscar con el teléfono normalizado
    const doc = await this.clientModel.findOne({ phone: normalized }).exec();
    
    this.logger.debug(`→ [findByPhone] Raw Mongo result: ${doc ? JSON.stringify(doc.toObject()) : 'null'}`);
    if (!doc) {
      this.logger.debug('→ [findByPhone] No client found, returning null');
      return null;
    }
    const domain = this.mapToDomain(doc);
    this.logger.debug(`→ [findByPhone] Mapped to domain: ${JSON.stringify(domain)}`);
    return domain;
  } catch (error) {
    this.logger.error(`Error in findByPhone(${phone}): ${(error as Error).message}`, (error as Error).stack);
    throw error;
  }
}

  async findByEmail(email: string): Promise<Client | null> {
    this.logger.debug(`→ [findByEmail] Input email: "${email}"`);
    try {
      const normalized = email.trim().toLowerCase();
      this.logger.debug(`→ [findByEmail] Normalized email: "${normalized}"`);
      this.logger.debug(`→ [findByEmail] Query filter: { email: "${normalized}" }`);
      const doc = await this.clientModel.findOne({ email: normalized }).exec();
      this.logger.debug(`→ [findByEmail] Raw Mongo result: ${doc ? JSON.stringify(doc.toObject()) : 'null'}`);
      if (!doc) {
        this.logger.debug('→ [findByEmail] No client found, returning null');
        return null;
      }
      const domain = this.mapToDomain(doc);
      this.logger.debug(`→ [findByEmail] Mapped to domain: ${JSON.stringify(domain)}`);
      return domain;
    } catch (error) {
      this.logger.error(`Error in findByEmail(${email}): ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async findAll(): Promise<Client[]> {
    this.logger.debug('→ [findAll] Fetching all clients');
    try {
      const docs = await this.clientModel.find().exec();
      this.logger.debug(`→ [findAll] Raw Mongo results count: ${docs.length}`);
      const domains = docs.map(d => this.mapToDomain(d));
      this.logger.debug('→ [findAll] Mapped all clients to domain entities');
      return domains;
    } catch (error) {
      this.logger.error(`Error in findAll: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async create(data: CreateClientDto): Promise<Client> {
    this.logger.debug(`→ [create] Input data: ${JSON.stringify(data)}`);
    try {
      const created = new this.clientModel(data);
      this.logger.debug(`→ [create] New document instance prepared`);
      const saved = await created.save();
      this.logger.debug(`→ [create] Saved Mongo document: ${JSON.stringify(saved.toObject())}`);
      const domain = this.mapToDomain(saved);
      this.logger.debug(`→ [create] Mapped to domain: ${JSON.stringify(domain)}`);
      return domain;
    } catch (error) {
      this.logger.error(`Error in create: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    this.logger.debug(`→ [update] Input id: "${id}", data: ${JSON.stringify(data)}`);
    try {
      const updated = await this.clientModel.findByIdAndUpdate(id, data, { new: true }).exec();
      this.logger.debug(`→ [update] Raw Mongo result: ${updated ? JSON.stringify(updated.toObject()) : 'null'}`);
      if (!updated) {
        this.logger.error(`→ [update] Client not found for id: ${id}`);
        throw new Error('Client not found');
      }
      const domain = this.mapToDomain(updated);
      this.logger.debug(`→ [update] Mapped to domain: ${JSON.stringify(domain)}`);
      return domain;
    } catch (error) {
      this.logger.error(`Error in update(${id}): ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async disableClient(id: string): Promise<void> {
    this.logger.debug(`→ [disableClient] Input id: "${id}"`);
    try {
      await this.clientModel.findByIdAndUpdate(id, { active: false }).exec();
      this.logger.debug(`→ [disableClient] Client disabled for id: ${id}`);
    } catch (error) {
      this.logger.error(`Error in disableClient(${id}): ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

 // src/infrastructure/mongodb/repositories/mongo-client.repository.ts

async exists(phone: string): Promise<boolean> {
  this.logger.debug(`→ [exists] Input phone: "${phone}"`);
  try {
    // Normalizar el teléfono de la misma manera
    const normalized = phone ? phone.replace(/\D/g, '').trim() : '';
    this.logger.debug(`→ [exists] Normalized phone: "${normalized}"`);
    
    const doc = await this.clientModel.findOne({ phone: normalized }).exec();
    const exists = !!doc;
    this.logger.debug(`→ [exists] Exists result for phone "${normalized}": ${exists}`);
    return exists;
  } catch (error) {
    this.logger.error(`Error in exists(${phone}): ${(error as Error).message}`, (error as Error).stack);
    throw error;
  }
}

  async count(): Promise<number> {
    this.logger.debug('→ [count] Counting documents');
    try {
      const total = await this.clientModel.countDocuments().exec();
      this.logger.debug(`→ [count] Total clients: ${total}`);
      return total;
    } catch (error) {
      this.logger.error(`Error in count: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async updateActiveClientsSince(date: Date): Promise<number> {
    this.logger.debug(`→ [updateActiveClientsSince] Input date: ${date.toISOString()}`);
    try {
      const res = await this.clientModel
        .updateMany({ lastInteraction: { $gte: date } }, { active: true })
        .exec();
      this.logger.debug(`→ [updateActiveClientsSince] Modified count: ${res.modifiedCount}`);
      return res.modifiedCount;
    } catch (error) {
      this.logger.error(`Error in updateActiveClientsSince: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async updateInactiveClientsBefore(date: Date): Promise<number> {
    this.logger.debug(`→ [updateInactiveClientsBefore] Input date: ${date.toISOString()}`);
    try {
      const res = await this.clientModel
        .updateMany(
          { $or: [{ lastInteraction: { $lt: date } }, { lastInteraction: null }] },
          { active: false },
        )
        .exec();
      this.logger.debug(`→ [updateInactiveClientsBefore] Modified count: ${res.modifiedCount}`);
      return res.modifiedCount;
    } catch (error) {
      this.logger.error(`Error in updateInactiveClientsBefore: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async findClientsWithInteractionSince(date: Date): Promise<Client[]> {
    this.logger.debug(`→ [findClientsWithInteractionSince] Input date: ${date.toISOString()}`);
    try {
      const docs = await this.clientModel.find({ lastInteraction: { $gte: date } }).exec();
      this.logger.debug(`→ [findClientsWithInteractionSince] Raw results count: ${docs.length}`);
      const domains = docs.map(d => this.mapToDomain(d));
      this.logger.debug('→ [findClientsWithInteractionSince] Mapped domain entities');
      return domains;
    } catch (error) {
      this.logger.error(`Error in findClientsWithInteractionSince: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async findClientsWithoutInteractionSince(date: Date): Promise<Client[]> {
    this.logger.debug(`→ [findClientsWithoutInteractionSince] Input date: ${date.toISOString()}`);
    try {
      const docs = await this.clientModel
        .find({ $or: [{ lastInteraction: { $lt: date } }, { lastInteraction: null }] })
        .exec();
      this.logger.debug(`→ [findClientsWithoutInteractionSince] Raw results count: ${docs.length}`);
      const domains = docs.map(d => this.mapToDomain(d));
      this.logger.debug('→ [findClientsWithoutInteractionSince] Mapped domain entities');
      return domains;
    } catch (error) {
      this.logger.error(`Error in findClientsWithoutInteractionSince: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async findClientsByDate(limit: number, date: Date): Promise<{ name: string; phone: string }[]> {
    this.logger.debug(`→ [findClientsByDate] Input limit: ${limit}, date: ${date.toISOString()}`);
    try {
      const clients = await this.clientModel
        .find({ createdAt: { $gte: date } })
        .limit(limit)
        .select({ name: 1, phone: 1, _id: 0 })
        .lean();
      this.logger.debug(`→ [findClientsByDate] Raw results: ${JSON.stringify(clients)}`);
      return clients;
    } catch (error) {
      this.logger.error(`Error in findClientsByDate: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async findTop100WithRecentInteraction(): Promise<Client[]> {
    this.logger.debug('→ [findTop100WithRecentInteraction] Fetching top 100 sorted by lastInteraction desc');
    try {
      const docs = await this.clientModel
        .find()
        .sort({ lastInteraction: -1 })
        .limit(100)
        .exec();
      this.logger.debug(`→ [findTop100WithRecentInteraction] Raw results count: ${docs.length}`);
      const domains = docs.map(d => this.mapToDomain(d));
      this.logger.debug('→ [findTop100WithRecentInteraction] Mapped domain entities');
      return domains;
    } catch (error) {
      this.logger.error(`Error in findTop100WithRecentInteraction: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
//   async debugDumpPhones(): Promise<string[]> {
//   const all = await this.clientModel.find().lean().exec();
//   const phones = all.map(doc => doc.phone);
//   this.logger.warn('▶ All phones in DB:', JSON.stringify(phones));
//   return phones;
// }
}
