import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: 401,
      message: 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS',
    });
  }
}
