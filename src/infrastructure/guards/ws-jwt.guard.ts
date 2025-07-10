import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';


@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

 canActivate(context: ExecutionContext): boolean {
  console.log("🛡️ WsRolesGuard ejecutado para socket");

  const client: Socket = context.switchToWs().getClient();
  const handler = context.getHandler();

  const allowedRoles = this.reflector.get<string[]>('roles', handler);
  console.log("🔍 Roles permitidos para el handler:", allowedRoles);

 if (!allowedRoles || allowedRoles.length === 0) {
  console.log("ℹ️ No hay roles definidos, acceso permitido por defecto");

  // Verificamos el token igual y guardamos el usuario
  const token = client.handshake.auth?.token;
  console.log("🔑 Token recibido en handshake:", token ? "Sí" : "No");

  if (!token) {
    console.error("❌ Token no proporcionado en handshake");
    throw new UnauthorizedException('Token no proporcionado');
  }

  let payload: any;
  try {
    payload = this.jwtService.verify(token);
    console.log("✅ Token verificado con éxito:", payload);
  } catch (err) {
    console.error("❌ Error verificando token:", err.message);
    throw new UnauthorizedException('Token inválido o expirado');
  }

  const userRole = payload.role;
  const userId = payload.sub;

  // Guardar el usuario en el socket
  client.data.user = {
    sub: userId,
    role: userRole,
  };
  console.log("🔒 Usuario guardado en client.data.user:", client.data.user);

  return true;
}


  const token = client.handshake.auth?.token;
  console.log("🔑 Token recibido en handshake:", token ? "Sí" : "No");

  if (!token) {
    console.error("❌ Token no proporcionado en handshake");
    throw new UnauthorizedException('Token no proporcionado');
  }

  let payload: any;
  try {
    payload = this.jwtService.verify(token);
    console.log("✅ Token verificado con éxito:", payload);
  } catch (err) {
    console.error("❌ Error verificando token:", err.message);
    throw new UnauthorizedException('Token inválido o expirado');
  }

  const userRole = payload.role;
  const userId = payload.sub;

  console.log(`🔐 Payload contiene userId: ${userId}, userRole: ${userRole}`);

  if (!allowedRoles.includes(userRole)) {
    console.warn(`⚠️ Acceso denegado para rol: ${userRole}, roles permitidos: ${allowedRoles}`);
    throw new ForbiddenException(`Acceso denegado para el rol: ${userRole}`);
  }

  // Guardar el usuario en el socket
  client.data.user = {
    sub: userId,
    role: userRole,
  };
  console.log("🔒 Usuario guardado en client.data.user:", client.data.user);

  return true;
}

}
