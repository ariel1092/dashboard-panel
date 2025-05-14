import { UpdateClientDto } from "src/aplication/clients/DTO/update-client.dto";

import { CreateClientDto } from "src/aplication/clients/DTO/create-client.dto";
import { ClientRepository } from "src/domain/clients/client-repository.interface";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, Inject } from '@nestjs/common';
import { Client } from "src/domain/clients/entities/client.entity";
import { ClientDocument } from "../schema/client.schema";

@Injectable()
export class MongoClientRepository implements ClientRepository {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  private mapToDomain(doc: ClientDocument): Client {
    return doc.toDomain();
  }

  async findById(id: string): Promise<Client | null> {
    const doc = await this.clientModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByPhone(phone: string): Promise<Client | null> {
    const doc = await this.clientModel.findOne({ phone }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const doc = await this.clientModel.findOne({ email }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findAll(): Promise<Client[]> {
    const docs = await this.clientModel.find().exec();
    return docs.map(d => this.mapToDomain(d));
  }

  async create(data: CreateClientDto): Promise<Client> {
    const created = new this.clientModel(data);
    const saved = await created.save();
    return this.mapToDomain(saved);
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const updated = await this.clientModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new Error('Client not found');
    return this.mapToDomain(updated);
  }

  async disableClient(id: string): Promise<void> {
    await this.clientModel.findByIdAndUpdate(id, { active: false }).exec();
  }

  async exists(phone: string): Promise<boolean> {
    const doc = await this.clientModel.findOne({ phone }).exec();
    return !!doc;
  }

  async count(): Promise<number> {
    return this.clientModel.countDocuments().exec();
  }

  async updateActiveClientsSince(date: Date): Promise<number> {
    const res = await this.clientModel
      .updateMany({ lastInteraction: { $gte: date } }, { active: true })
      .exec();
    return res.modifiedCount;
  }

  async updateInactiveClientsBefore(date: Date): Promise<number> {
    const res = await this.clientModel
      .updateMany(
        { $or: [{ lastInteraction: { $lt: date } }, { lastInteraction: null }] },
        { active: false },
      )
      .exec();
    return res.modifiedCount;
  }

  async findClientsWithInteractionSince(date: Date): Promise<Client[]> {
    const docs = await this.clientModel
      .find({ lastInteraction: { $gte: date } })
      .exec();
    return docs.map(d => this.mapToDomain(d));
  }

  async findClientsWithoutInteractionSince(date: Date): Promise<Client[]> {
    const docs = await this.clientModel
      .find({
        $or: [{ lastInteraction: { $lt: date } }, { lastInteraction: null }],
      })
      .exec();
    return docs.map(d => this.mapToDomain(d));
  }
}
