import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

import { JwtService } from '@nestjs/jwt';
import { UserRepository } from "src/domain/repositories/user.repository";
import { User } from "src/infrastructure/schema/user.schema";



@Injectable()
export class ConnectUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(socket: Socket): Promise<{ user: User }> {
    const user = await this.authenticateUser(socket);
    socket.data.user = user;
    console.log(`User connected: ${user.email}`);

    return { user };
  }

  private async authenticateUser(socket: Socket): Promise<User> {
    const token = socket.handshake.auth.token;
    const email = this.extractEmailFromToken(token);
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Unauthorized");
    return user;
  }

private extractEmailFromToken(token: string): string {
  try {
    const payload = this.jwtService.verify(token); // 👈 valida firma y expiración
    if (!payload.email) throw new Error("Email not found in token");
    return payload.email;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

}
