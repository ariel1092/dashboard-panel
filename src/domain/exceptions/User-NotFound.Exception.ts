import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super({
      statusCode: 404,
      message: 'El usuario no existe',
      code: 'USER_NOT_FOUND',
    });
  }
}
