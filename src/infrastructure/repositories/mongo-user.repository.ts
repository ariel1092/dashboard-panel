// infrastructure/repositories/mongo-user.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {  UserDocument } from '../schema/user.schema';

import { User, UserRole } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/repositories/user.repository';


@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>
  ) {}

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.userModel.findById(id).exec();
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email }).exec();
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel(user);
    const saved = await createdUser.save();
    return this.toDomain(saved);
  }

  async update(user: User): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(
      user.id,
      {
        email: user.email,
        password: user.password,
        role: user.role,
        updatedAt: new Date(),
      },
      { new: true }
    ).exec();

    return updated ? this.toDomain(updated) : user;
  }

  private toDomain(userDoc: UserDocument): User {
    return new User(
      //'userDoc._id' is of type 'unknown'.ts(18046)
      userDoc.id,
      userDoc.email,
      userDoc.password,
      userDoc.role,
      userDoc.createdAt,
      userDoc.updatedAt,
    );
  }
}
