import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
  constructor(message = 'El usuario ya existe') {
    super(message);
  }
}