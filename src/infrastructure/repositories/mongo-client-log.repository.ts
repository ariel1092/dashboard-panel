import {  Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientLogRepository } from '../../domain/repositories/client-log-repository.interface';
import { ClientLog, ClientLogDocument } from '../schema/client-log.schema';






@Injectable()
export class MongoClientLogRepository implements ClientLogRepository {
  constructor(
    @InjectModel(ClientLog.name) // 👈 CAMBIAR ESTO
    private readonly logModel: Model<ClientLogDocument>,
  ) {}

  async findAll(): Promise<ClientLogDocument[]> {
    return this.logModel.find().sort({ date: -1 }).exec();
  }

  async createLog(log: {
    message: string;
    activeUpdated: number;
    inactiveUpdated: number;
    activeClients: { name: string; phone: string }[];
    inactiveClients: { name: string; phone: string }[];
  }): Promise<void> {
    await this.logModel.create(log);
  }
}
