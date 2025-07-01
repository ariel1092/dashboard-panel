import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService implements TokenService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

  // Cambiar el método para aceptar payload genérico
  generateToken(payload: Record<string, any>): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '1d' });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET);
  }
}
