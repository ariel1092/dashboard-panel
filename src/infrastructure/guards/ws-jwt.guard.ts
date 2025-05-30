import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient()

      // Aquí deberías validar el JWT
      // Por ahora, verificamos que tenga userId
      if (!client.userId) {
        throw new WsException("No autorizado")
      }

      return true
    } catch (error) {
      throw new WsException("Token inválido")
    }
  }
}
