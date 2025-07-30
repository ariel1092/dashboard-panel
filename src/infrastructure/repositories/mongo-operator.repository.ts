import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';

import { OperatorRepository } from 'src/domain/operators/repositories/operator.repository';
import { Operator } from 'src/domain/operators/entities/operator.entity';
import { OperatorDocument, OperatorModel } from '../schema/operator.schema';


@Injectable()
export class MongoOperatorRepository implements OperatorRepository {
  private readonly logger = new Logger(MongoOperatorRepository.name);

  constructor(
    @InjectModel(OperatorModel.name)
    private readonly model: Model<OperatorDocument>,
  ) {}
async findByName(name: string): Promise<Operator | null> {
    try {
      this.logger.log(`Finding operator by name: ${name}`);

      if (!name || typeof name !== 'string') {
        throw new Error('Invalid operator name provided');
      }

      const doc = await this.model.findOne({ name }).exec();

      if (!doc) {
        this.logger.warn(`Operator not found with name: ${name}`);
        return null;
      }

      this.logger.log(`Found operator: ${doc.email}`);
      return this.mapToEntity(doc);
    } catch (error) {
      this.logger.error(`Failed to find operator by name: ${name}`, error.stack);
      throw new InternalServerErrorException(
        'Error retrieving operator by name',
        error.message,
      );
    }
  }
  async findAvailable(): Promise<Operator[]> {
    try {
      this.logger.log('Finding available operators');

      const docs = await this.model
        .find({ isAvailable: true })
        .select('name isAvailable activeChats lastMessageTime')
        .exec();

      this.logger.log(`Found ${docs.length} available operators`);

      return docs.map((doc) => this.mapToEntity(doc));
    } catch (error) {
      this.logger.error('Failed to find available operators', error.stack);
      throw new InternalServerErrorException(
        'Error retrieving available operators',
        error.message,
      );
    }
  }

  async findById(id: string): Promise<Operator | null> {
    try {
      this.logger.log(`Finding operator by ID: ${id}`);

      if (!id || typeof id !== 'string') {
        throw new Error('Invalid operator ID provided');
      }

      // Validar formato ObjectId
      if (!Types.ObjectId.isValid(id)) {
        this.logger.warn(`Invalid ObjectId format: ${id}`);
        return null;
      }

      const doc = await this.model.findById(id).exec();

      if (!doc) {
        this.logger.warn(`Operator not found with ID: ${id}`);
        return null;
      }

      this.logger.log(`Found operator: ${doc.email}`);
      return this.mapToEntity(doc);
    } catch (error) {
      this.logger.error(`Failed to find operator by ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'Error retrieving operator',
        error.message,
      );
    }
  }
async save(operator: Operator): Promise<Operator> {
  try {
    this.logger.log(`Saving new operator: ${operator.email}`);

    this.validateOperator(operator);

    const created = await this.model.create({
      _id: operator.id,
      name: operator.name,
      email: operator.email, // Asegúrate de que el DTO también tenga este campo
      isAvailable: operator.isAvailable,
      activeChats: operator.activeChats,
      lastMessageTime: operator.lastMessageTime,
    });

    this.logger.log(`Successfully saved operator: ${operator.email}`);
    console.log(`Operator saved with ID: ${operator.id}`);

    return new Operator(
      created._id.toString(),
      created.name,
      created.email,
      created.isAvailable,
      created.activeChats,
      created.lastMessageTime,
      'operador', // Rol fijo por ahora
    );
  } catch (error) {
    if (error.code === 11000) {
      this.logger.error(`Duplicate operator name: ${operator.email}`);
      throw new ConflictException('El operador ya existe');
    }

    this.logger.error(
      `Failed to save operator: ${operator.email}`,
      error.stack,
    );
    throw new InternalServerErrorException(
      'Error al guardar el operador',
      error.message,
    );
  }
}


  async update(operator: Operator): Promise<Operator> {
    try {
      this.logger.log(`Updating operator: ${operator.id}`);

      if (!operator.id) {
        throw new Error('Operator ID is required for update');
      }

      this.validateOperator(operator);

      const updatedDoc = await this.model
        .findByIdAndUpdate(
          operator.id,
          {
            name: operator.name,
            email: operator.email,
            isAvailable: operator.isAvailable,
            activeChats: operator.activeChats,
            lastMessageTime: operator.lastMessageTime,
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedDoc) {
        this.logger.warn(`Operator not found for update: ${operator.id}`);
        throw new NotFoundException(
          `Operator with ID ${operator.id} not found`,
        );
      }

      this.logger.log(`Successfully updated operator: ${operator.id}`);
      return this.mapToEntity(updatedDoc);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.name === 'CastError') {
        this.logger.warn(`Invalid ObjectId format for update: ${operator.id}`);
        throw new Error('Invalid operator ID format');
      }

      if (error.code === 11000) {
        this.logger.error(
          `Duplicate operator name during update: ${operator.email}`,
        );
        throw new Error('Operator with this name already exists');
      }

      this.logger.error(
        `Failed to update operator: ${operator.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error updating operator',
        error.message,
      );
    }
  }

  /**
   * Mapea un documento de MongoDB a una entidad de dominio
   */
  private mapToEntity(doc: OperatorDocument): Operator {
    try {
      if (!doc) {
        throw new Error('Document is null or undefined');
      }

      // Validación básica de datos
      if (!doc.email || doc.email.trim() === '') {
        throw new Error('Operator name is required');
      }

      if (typeof doc.isAvailable !== 'boolean') {
        throw new Error('Operator availability status is invalid');
      }

      if (doc.activeChats < 0) {
        throw new Error('Active chats count cannot be negative');
      }

      return new Operator(
        doc.id,
        doc.name,
        doc.email, // Asegúrate de que el DTO también tenga este campo
        doc.isAvailable,
        doc.activeChats,
        doc.lastMessageTime,
      );
    } catch (error) {
      this.logger.error('Failed to map document to entity', error.stack);
      throw new Error(`Invalid operator data: ${error.message}`);
    }
  }

  /**
   * Valida los datos de un operador antes de guardar/actualizar
   */
  private validateOperator(operator: Operator): void {
    if (!operator) {
      throw new Error('Operator is required');
    }

    if (!operator.email || operator.email.trim() === '') {
      throw new Error('Operator email is required and cannot be empty');
    }

    if (typeof operator.isAvailable !== 'boolean') {
      throw new Error('Operator availability status must be a boolean');
    }

    if (operator.activeChats < 0) {
      throw new Error('Active chats count cannot be negative');
    }

    if (operator.activeChats > 50) {
      throw new Error('Active chats count cannot exceed 50');
    }
  }
  async updateStatus(userId: string, isAvailable: boolean): Promise<void> {
    try {
      const updated = await this.model.findByIdAndUpdate(
        userId,
        { isAvailable, lastMessageTime: new Date() },
        { new: true },
      );
      if (!updated) {
        this.logger.warn(`Operator not found when updating status: ${userId}`);
      } else {
        this.logger.log(`Operator ${userId} status updated to: ${isAvailable}`);
      }
    } catch (error) {
      this.logger.error(
        `Error updating status for operator ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error updating operator status');
    }
  }

}
