import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientDocument } from '../schema/client.schema';


@Injectable()
export class ClientLogService {
  constructor(
    @InjectModel('ClientLog') private readonly logModel: Model<ClientDocument>,
  ) {}

  async findAll(): Promise<ClientDocument[]> {
    return this.logModel.find().sort({ date: -1 }).exec();
  }
}
