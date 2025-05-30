import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets"
import type { Server, Socket } from "socket.io"
import { UseGuards, Logger } from "@nestjs/common"


import { SendMessageUseCase } from "src/aplication/chat/use-cases/send-message.use-case"
import { CreateChatUseCase } from "src/aplication/chat/use-cases/create-chat.use-case"
import { AssignSpecialistUseCase } from "src/aplication/chat/use-cases/assign-specialist.use-case"
import { SendMessageDto } from "src/aplication/chat/dto/send-message.dto"
import { JoinChatDto } from "src/aplication/chat/dto/join-chat.dto"
import { WsJwtGuard } from "../guards/ws-jwt.guard"
import { LlamaApiService } from "../IA-llama/llama-api.service"

interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ChatGateway.name)
  private connectedUsers = new Map<string, string>() // userId -> socketId

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly createChatUseCase: CreateChatUseCase,
    private readonly assignSpecialistUseCase: AssignSpecialistUseCase,
     private readonly llamaService: LlamaApiService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Aquí deberías validar el JWT del cliente
      // Por ahora, asumimos que el userId viene en el handshake
      const userId = client.handshake.auth?.userId
      const userRole = client.handshake.auth?.userRole || "CLIENT"

      if (!userId) {
        this.logger.warn(`Cliente ${client.id} desconectado: No userId provided`)
        client.disconnect()
        return
      }

      client.userId = userId
      client.userRole = userRole

      // Registrar usuario conectado
      this.connectedUsers.set(userId, client.id)

      // Unir a sala personal y sala de rol
      await client.join(`user:${userId}`)
      await client.join(`role:${userRole}`)

      this.logger.log(`Usuario ${userId} conectado con socket ${client.id}`)

      // Notificar conexión a especialistas si es cliente
      if (userRole === "CLIENT") {
        this.server.to("role:SPECIALIST").emit("client-connected", {
          userId,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`)
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId)
      this.logger.log(`Usuario ${client.userId} desconectado`)

      // Notificar desconexión
      if (client.userRole === "CLIENT") {
        this.server.to("role:SPECIALIST").emit("client-disconnected", {
          userId: client.userId,
          timestamp: new Date(),
        })
      }
    }
  }

@SubscribeMessage("sendMessage")
@UseGuards(WsJwtGuard)
async handleMessage(client: AuthenticatedSocket, data: SendMessageDto) {
  try {
    const message = await this.sendMessageUseCase.execute(
      data.userId,
      data.chatId,
      data.content,
      data.receiverId
    );

    this.server.to(`chat:${data.chatId}`).emit("newMessage", {
      id: message.id,
      userId: message.userId,
      chatId: message.chatId,
      content: message.content,
      receiverId: message.receiverId,
      isRead: message.isRead,
      timestamp: message.timestamp,
    });

    this.logger.log(`Mensaje enviado en chat ${data.chatId} por usuario ${data.userId}`);

    // 🤖 Generar y enviar respuesta automática del bot
    if (client.userRole === "CLIENT") {
      console.log(`💬 Mensaje recibido de usuario ${data.userId}:`, message);
      const aiReply = await this.llamaService.generateMessage(data.content);
console.log(`🤖 Respuesta de IA para el usuario ${data.userId}:`, aiReply);
      const botMessage = await this.sendMessageUseCase.execute(
        "BOT", // ID ficticio del bot
        data.chatId,
        aiReply,
        data.userId
      );

      this.server.to(`chat:${data.chatId}`).emit("newMessage", {
        id: botMessage.id,
        userId: "BOT",
        chatId: data.chatId,
        content: aiReply,
        receiverId: data.userId,
        isRead: false,
        timestamp: botMessage.timestamp,
      });

      this.logger.log(`Respuesta automática enviada por el bot en chat ${data.chatId}`);
    }

  } catch (error) {
    this.logger.error(`Error enviando mensaje: ${error.message}`);
    client.emit("error", { message: "Error enviando mensaje" });
  }
}


  @SubscribeMessage("joinChat")
  @UseGuards(WsJwtGuard)
  async handleJoinChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
    await client.join(`chat:${data.chatId}`)
    this.logger.log(`Usuario ${client.userId} se unió al chat ${data.chatId}`)

    client.emit("joinedChat", {
      chatId: data.chatId,
      timestamp: new Date(),
    })
  }

  @SubscribeMessage("leaveChat")
  @UseGuards(WsJwtGuard)
  async handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
    await client.leave(`chat:${data.chatId}`)
    this.logger.log(`Usuario ${client.userId} salió del chat ${data.chatId}`)
  }

  @SubscribeMessage("typingStart")
  @UseGuards(WsJwtGuard)
  handleTypingStart(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
    client.to(`chat:${data.chatId}`).emit("userTyping", {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: true,
    })
  }

  @SubscribeMessage("typingStop")
  @UseGuards(WsJwtGuard)
  handleTypingStop(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
    client.to(`chat:${data.chatId}`).emit("userTyping", {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: false,
    })
  }

  @SubscribeMessage('createChat')
  @UseGuards(WsJwtGuard)
  async handleCreateChat(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const chat = await this.createChatUseCase.execute();
      
      client.emit('chatCreated', {
        id: chat.id,
        status: chat.status,
        specialistId: chat.specialistId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      });

      this.logger.log(`Chat ${chat.id} creado por usuario ${client.userId}`);
    } catch (error) {
      this.logger.error(`Error creando chat: ${error.message}`);
      client.emit('error', { message: 'Error creando chat' });
    }
  }

  // Métodos para emitir eventos desde los casos de uso
  emitSpecialistAssigned(chatId: string, specialistId: string) {
    this.server.to(`chat:${chatId}`).emit("specialistAssigned", {
      chatId,
      specialistId,
      timestamp: new Date(),
    })
  }

  emitChatStatusChange(chatId: string, status: string) {
    this.server.to(`chat:${chatId}`).emit("chatStatusChanged", {
      chatId,
      status,
      timestamp: new Date(),
    })
  }

  // Verificar si un usuario está conectado
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }
}
