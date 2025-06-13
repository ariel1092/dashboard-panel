import { Model } from 'mongoose';
import { OperatorRepository } from 'src/domain/operators/repositories/operator.repository';

import { Operator } from 'src/domain/operators/entities/operator.entity';
import { OperatorDocument, OperatorModel } from '../schema/operator.schema';
import { InjectModel } from '@nestjs/mongoose';


export class MongoOperatorRepository implements OperatorRepository {
  constructor(
     @InjectModel(OperatorModel.name)
    private readonly model: Model<OperatorDocument>) {}

  async findAvailable(): Promise<Operator[]> {
    const docs = await this.model.find({ isAvailable: true }).exec();
    return docs.map(doc => new Operator(doc.id , doc.name, doc.isAvailable, doc.activeChats, doc.lastMessageTime));
  }

  async findById(id: string): Promise<Operator | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return null;
    return new Operator(doc.id, doc.name, doc.isAvailable, doc.activeChats, doc.lastMessageTime);
  }

  async save(operator: Operator): Promise<void> {
    await this.model.create({
      name: operator.name,
      isAvailable: operator.isAvailable,
      activeChats: operator.activeChats,
      lastMessageTime: operator.lastMessageTime,
    });
  }

  async update(operator: Operator): Promise<Operator> {
    const updatedDoc = await this.model.findByIdAndUpdate(
      operator.id,
      {
        name: operator.name,
        isAvailable: operator.isAvailable,
        activeChats: operator.activeChats,
        lastMessageTime: operator.lastMessageTime,
      },
      { new: true }
    ).exec();
    if (!updatedDoc) {
      throw new Error('Operator not found');
    }
    return new Operator(
      updatedDoc.id,
      updatedDoc.name,
      updatedDoc.isAvailable,
      updatedDoc.activeChats,
      updatedDoc.lastMessageTime
    );
  }
}
