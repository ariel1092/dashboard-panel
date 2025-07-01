// application/services/user.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/repositories/user.repository';
import { USER_REPOSITORY } from 'src/domain/token/user.repository.token';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
