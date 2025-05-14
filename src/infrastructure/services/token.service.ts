import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService implements TokenService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

  generateToken(userId: string): string {
    return jwt.sign({ id: userId }, this.JWT_SECRET, { expiresIn: '1d' });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET);
  }
}
