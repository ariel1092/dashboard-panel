
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { SendMessageUseCase } from 'src/aplication/chat/use-cases/send-message.use-case';
import { CreateChatUseCase } from 'src/aplication/chat/use-cases/create-chat.use-case';
import { AssignSpecialistUseCase } from 'src/aplication/chat/use-cases/assign-specialist.use-case';
import { SendMessageDto } from 'src/aplication/chat/dto/send-message.dto';
import { JoinChatDto } from 'src/aplication/chat/dto/join-chat.dto';
import { LlamaApiService } from '../IA-llama/llama-api.service';
import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
import { CHAT_REPOSITORY } from 'src/domain/token/chat.repository.token';
import { ChatRepository } from 'src/domain/chat/chat.repository.interface';
import { FinishChatUseCase } from 'src/aplication/chat/use-cases/finish-chat.use-case';
import { RateChatUseCase } from 'src/aplication/chat/use-cases/rate-chat.use-case';
import { RateChatDto } from 'src/aplication/chat/dto/rate-chat.dto';
import { FinishChatDto } from 'src/aplication/chat/dto/finish-chat.dto';
import { WsRolesGuard } from '../guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';


interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}


interface ConnectedUser {
  userId: string
  socketId: string
  userRole: string
  connectedAt: Date
  currentChatId?: string
}
@UseGuards(WsRolesGuard) // Para proteger eventos, aunque el handleConnection no se protege con guard por defecto
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: false,
  },
  namespace: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();
  private operatorChats = new Map<string, string[]>();
  private chatOperatorMap = new Map<string, string>();

  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly createChatUseCase: CreateChatUseCase,
    private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
    private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase,
    private readonly finishChatUseCase: FinishChatUseCase,
    private readonly rateChatUseCase: RateChatUseCase,
    private readonly llamaService: LlamaApiService,
    private readonly jwtService: JwtService, // inyectar JwtService para verificar token en conexión
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
  try {
    console.log('🔌 [ChatGateway] Nueva conexión entrante. client.data antes:', client.data);

    const token = client.handshake.auth?.token;
    if (!token) {
      console.error('❌ Token no proporcionado en handshake.auth. Desconectando socket.');
      client.disconnect();
      return;
    }

    // Verificar token y obtener payload
    const payload = this.jwtService.verify(token);
    console.log('✅ Token verificado en handleConnection:', payload);

    // Setear user en client.data
    const userId = payload.sub || payload.id;
    const userRole = payload.role?.toUpperCase();

    if (!userId || !userRole) {
      this.logger.warn(`Cliente ${client.id} desconectado: Falta userId o role.`);
      client.disconnect();
      return;
    }

    client.data.user = { sub: userId, role: userRole };
    client.userId = userId;
    client.userRole = userRole;

    console.log('🔒 client.data.user seteado en handleConnection:', client.data.user);

    const connectedUser: ConnectedUser = {
      userId,
      socketId: client.id,
      userRole,
      connectedAt: new Date(),
    };
    this.connectedUsers.set(userId, connectedUser);

    await client.join(`user:${userId}`);
    await client.join(`role:${userRole}`);

    this.logger.log(`✅ Usuario ${userId} conectado con socket ${client.id}`);

    this.broadcastConnectedUsers();

    if (userRole === 'OPERADOR') {
      console.log('🎧 [ChatGateway] Operador conectado, enviando dashboard');
      await this.sendOperatorDashboard(client);
    }

    if (userRole === 'CLIENTE') {
      console.log('👤 [ChatGateway] Cliente conectado, notificando a operadores');
      this.server.to('role:OPERADOR').emit('client-connected', {
        userId,
        timestamp: new Date(),
      });
    }

  } catch (error) {
    this.logger.error(`❌ Error en conexión: ${error.message}`);
    console.error(error);
    client.disconnect();
  }
}


  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      console.log(`🔌 [ChatGateway] Usuario ${client.userId} desconectándose`);
      this.connectedUsers.delete(client.userId);

      if (client.userRole === 'OPERADOR') {
        this.operatorChats.delete(client.userId!);
        console.log(`🎧 [ChatGateway] Operador ${client.userId} desconectado`);
      }

      this.logger.log(`🔌 Usuario ${client.userId} desconectado`);
      this.broadcastConnectedUsers();

      if (client.userRole === 'CLIENT') {
        this.server.to('role:OPERADOR').emit('client-disconnected', {
          userId: client.userId,
          timestamp: new Date(),
        });
      }
    }
  }

  private async sendOperatorDashboard(client: AuthenticatedSocket) {
    const connectedClients = Array.from(this.connectedUsers.values()).filter((user) => user.userRole === "CLIENT")
    const operatorChats = this.operatorChats.get(client.userId!) || []

    console.log(`📊 [ChatGateway] Enviando dashboard a ${client.userId}:`, {
      connectedClients: connectedClients.length,
      operatorChats: operatorChats.length,
    })

    client.emit("operatorDashboard", {
      connectedClients,
      assignedChats: operatorChats,
      totalConnectedUsers: this.connectedUsers.size,
      timestamp: new Date(),
    })
  }

private broadcastConnectedUsers() {
  const connectedClients = Array.from(this.connectedUsers.values())
    .filter((user) => user.userRole === "CLIENTE")
    .map((user) => ({
      userId: user.userId,
      connectedAt: user.connectedAt,
      currentChatId: user.currentChatId,
    }));

  const connectedOperators = Array.from(this.connectedUsers.values())
    .filter((user) => user.userRole === "OPERADOR")
    .map((user) => ({
      userId: user.userId,
      connectedAt: user.connectedAt,
      activeChats: this.operatorChats.get(user.userId)?.length || 0,
    }));

  console.log(`📡 [ChatGateway] Broadcasting users:`, {
    clients: connectedClients.length,
    operators: connectedOperators.length,
  });

  this.server.to("role:OPERADOR").emit("connectedUsersUpdate", {
    clients: connectedClients,
    operators: connectedOperators,
    timestamp: new Date(),
  });
}


  @SubscribeMessage("createChat")
  async handleMessage(client: AuthenticatedSocket) {
    try {
      if (!client.userId) {
        throw new Error("userId is required to create a chat")
      }

      console.log(`🆕 [ChatGateway] Creando chat para usuario ${client.userId}`)

      const chat = await this.createChatUseCase.execute({
        userId: client.userId,
        type: "IA",
      })

      const connectedUser = this.connectedUsers.get(client.userId)
      if (connectedUser) {
        connectedUser.currentChatId = chat.id
        this.connectedUsers.set(client.userId, connectedUser)
      }

      client.emit("chatCreated", {
        id: chat.id,
        status: chat.status,
        specialistId: chat.specialistId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })

      this.broadcastConnectedUsers()
      this.logger.log(`🆕 Chat ${chat.id} creado por usuario ${client.userId}`)
    } catch (error) {
      this.logger.error(`❌ Error creando chat: ${error.message}`)
      client.emit("error", { message: "Error creando chat" })
    }
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(client: AuthenticatedSocket, data: SendMessageDto) {
    try {
      const { chatId, content } = data

      console.log(`💬 [ChatGateway] Mensaje recibido en chat ${chatId}: "${content}"`)

      if (!chatId) throw new Error("chatId está ausente en sendMessage")
      if (!client.userId) throw new Error("userId ausente en socket")

      const allowedRoles = ["CLIENT", "OPERADOR", "BOT", "AI", "SYSTEM"] as const
      const senderType = allowedRoles.includes(client.userRole as any)
        ? (client.userRole as (typeof allowedRoles)[number])
        : "CLIENT"

      const savedMessage = await this.sendMessageUseCase.execute(client.userId, chatId, content, undefined, senderType)

      this.server.to(`chat:${chatId}`).emit("newMessage", {
        ...savedMessage,
        timestamp: new Date(),
      })

      const chat = await this.chatRepository.getChatById(chatId)
      if (!chat) throw new Error("Chat no encontrado")

      const hasSpecialist = chat.specialistId && chat.specialistId !== null
      const isIAChat = chat.type === "IA"
      const shouldBotRespond = isIAChat && !hasSpecialist && senderType === "CLIENT"

      console.log(`🤖 [ChatGateway] Estado del chat:`, {
        hasSpecialist,
        isIAChat,
        shouldBotRespond,
        chatType: chat.type,
        specialistId: chat.specialistId,
      })

      if (shouldBotRespond) {
        console.log("🤖 Bot va a responder...")
        this.server.to(`chat:${chatId}`).emit("botThinking", { chatId })

        const botResponse = await this.llamaService.generateMessage(content)
        const botMessage = await this.sendMessageUseCase.execute("bot-id", chatId, botResponse, client.userId, "BOT")

        this.server.to(`chat:${chatId}`).emit("newMessage", {
          ...botMessage,
          timestamp: new Date(),
        })
      }

      // 🔧 VERIFICACIÓN MEJORADA para escalamiento
      const shouldEscalate = shouldEscalateToHuman(content)
      console.log(`🔄 [ChatGateway] ¿Debería escalar?`, {
        shouldEscalate,
        hasSpecialist,
        content: content.toLowerCase(),
      })

      if (shouldEscalate && !hasSpecialist) {
        console.log("🔄 [ChatGateway] Escalando a humano automáticamente...")
        await this.autoAssignOperator(chatId, client.userId!)
      }

      this.logger.log(`Mensaje enviado en chat ${chatId} por ${client.userId}`)
    } catch (error) {
      this.logger.error(`Error al enviar mensaje en chat ${data.chatId}: ${error.message}`)
      client.emit("error", { message: "Error enviando mensaje" })
    }
  }

  private async autoAssignOperator(chatId: string, clientId: string) {
    try {
      console.log(`🔄 [ChatGateway] Iniciando asignación automática para chat ${chatId}`)

      // Verificar operadores conectados
      const connectedOperators = Array.from(this.connectedUsers.values()).filter(
        (user) => user.userRole === "OPERADOR",
      )

      console.log(`🎧 [ChatGateway] Operadores conectados: ${connectedOperators.length}`)

      if (connectedOperators.length === 0) {
        throw new Error("No hay operadores conectados")
      }

      const operator = await this.assignOperatorUseCase.execute()
      console.log(`✅ [ChatGateway] Operador asignado:`, operator)

      await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id)

      // Guardar mapeo de chat a operador
      this.chatOperatorMap.set(chatId, operator.id)
      console.log(`🗺️ [ChatGateway] Mapeo guardado: Chat ${chatId} -> Operador ${operator.id}`)

      // Agregar chat a la lista del operador
      const operatorChats = this.operatorChats.get(operator.id) || []
      operatorChats.push(chatId)
      this.operatorChats.set(operator.id, operatorChats)
      console.log(`📋 [ChatGateway] Chats del operador ${operator.id}:`, operatorChats)

      // Buscar el socket del operador
      const operatorUser = this.connectedUsers.get(operator.id)
      console.log(`🔍 [ChatGateway] Buscando operador conectado:`, {
        operatorId: operator.id,
        found: !!operatorUser,
        socketId: operatorUser?.socketId,
      })

      if (operatorUser) {
        const operatorSocket = this.server.sockets.sockets.get(operatorUser.socketId)
        console.log(`🔌 [ChatGateway] Socket del operador encontrado:`, !!operatorSocket)

        if (operatorSocket) {
          await operatorSocket.join(`chat:${chatId}`)
          console.log(`🏠 [ChatGateway] Operador unido al room chat:${chatId}`)

          const history = await this.chatRepository.getMessagesByChatId(chatId)
          console.log(`📚 [ChatGateway] Historial del chat: ${history.length} mensajes`)

          // 🔧 EVENTO MEJORADO con más información
          operatorSocket.emit("chatAutoAssigned", {
            chatId,
            clientId,
            operatorId: operator.id,
            operatorName: operator.name,
            message: "🚨 Nuevo chat asignado automáticamente",
            history: history.map((msg) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.senderType,
              timestamp: msg.timestamp,
              chatId: msg.chatId,
              senderName: this.getSenderName(msg.senderType, msg.userId),
            })),
            timestamp: new Date(),
          })

          console.log(`📤 [ChatGateway] Evento chatAutoAssigned enviado al operador ${operator.id}`)

          // Actualizar dashboard del operador
          this.sendOperatorDashboard(operatorSocket as AuthenticatedSocket)
        }
      }

      // Notificar al cliente sobre la asignación
      this.emitSpecialistAssigned(chatId, operator.id)
      this.emitChatStatusChange(chatId, "ESCALATED")

      // Mensaje del sistema
      const systemMessage = await this.sendMessageUseCase.execute(
        "system",
        chatId,
        `🎧 ${operator.name} se ha unido al chat. La IA ya no responderá automáticamente.`,
        undefined,
        "SYSTEM",
      )

      this.server.to(`chat:${chatId}`).emit("newMessage", {
        ...systemMessage,
        timestamp: new Date(),
      })

      // 🔧 NOTIFICAR A TODOS LOS OPERADORES sobre la asignación
      this.server.to("role:OPERADOR").emit("operatorAssigned", {
        chatId,
        clientId,
        operatorId: operator.id,
        operatorName: operator.name,
        timestamp: new Date(),
      })

      this.broadcastConnectedUsers()
      console.log("✅ [ChatGateway] Escalamiento automático completado exitosamente")
    } catch (assignErr) {
      console.error(`❌ [ChatGateway] Error en asignación automática:`, assignErr)
      this.logger.warn(`No hay operadores disponibles para el chat ${chatId}: ${assignErr.message}`)

      this.server.to(`chat:${chatId}`).emit("chatInQueue", {
        chatId,
        message: "⏳ Actualmente no hay operadores disponibles. Estás en la cola de atención.",
        timestamp: new Date(),
      })

      this.server.to("role:OPERADOR").emit("chatInQueue", {
        chatId,
        clientId: clientId,
        message: "⏳ Chat en cola esperando operador disponible",
        timestamp: new Date(),
      })
    }
  }

  private getSenderName(senderType: string, userId: string): string {
    switch (senderType) {
      case "BOT":
        return "IA Assistant"
      case "CLIENT":
        return `Cliente ${userId}`
      case "OPERADOR":
        return `Operador ${userId}`
      case "SYSTEM":
        return "Sistema"
      default:
        return userId
    }
  }
// @UseGuards(WsRolesGuard)

// @Roles('OPERADOR')
  @SubscribeMessage("finishChat")
  async handleFinishChat(client: AuthenticatedSocket, data: FinishChatDto) {
    console.log("🏁 [ChatGateway] finishChat called:", data)
    console.log("🏁 [ChatGateway] Usuario que intenta finalizar:", client.userId)

    if (client.userRole !== "OPERADOR") {
      client.emit("error", { message: "Solo operadores pueden finalizar chats" })
      return
    }

    try {
      const assignedOperatorId = this.chatOperatorMap.get(data.chatId)
      console.log("🗺️ [ChatGateway] Operador asignado al chat:", assignedOperatorId)
      console.log("🗺️ [ChatGateway] Operador actual:", client.userId)

      if (!assignedOperatorId) {
        const chat = await this.chatRepository.getChatById(data.chatId)
        if (chat && chat.specialistId) {
          this.chatOperatorMap.set(data.chatId, chat.specialistId)
          console.log("🗺️ [ChatGateway] Operador recuperado de BD:", chat.specialistId)
        }
      }

      const connectedOperators = Array.from(this.connectedUsers.values())
        .filter((user) => user.userRole === "OPERADOR")
        .map((user) => user.userId)

      if (!connectedOperators.includes(client.userId!)) {
        client.emit("error", { message: "Usuario no autorizado para finalizar chats" })
        return
      }

      const operatorIdToUse = assignedOperatorId || client.userId!

      console.log("🏁 [ChatGateway] Finalizando chat con operador:", operatorIdToUse)
      const finishedChat = await this.finishChatUseCase.execute(data.chatId, operatorIdToUse, data.reason)

      this.chatOperatorMap.delete(data.chatId)

      const operatorChats = this.operatorChats.get(operatorIdToUse) || []
      const updatedChats = operatorChats.filter((id) => id !== data.chatId)
      this.operatorChats.set(operatorIdToUse, updatedChats)

      if (client.userId !== operatorIdToUse) {
        const currentOperatorChats = this.operatorChats.get(client.userId!) || []
        const currentUpdatedChats = currentOperatorChats.filter((id) => id !== data.chatId)
        this.operatorChats.set(client.userId!, currentUpdatedChats)
      }

      const systemMessage = await this.sendMessageUseCase.execute(
        "system",
        data.chatId,
        "✅ El operador ha finalizado este chat. ¡Gracias por contactarnos!",
        undefined,
        "SYSTEM",
      )

      this.server.to(`chat:${data.chatId}`).emit("newMessage", {
        ...systemMessage,
        timestamp: new Date(),
      })

      this.server.to(`chat:${data.chatId}`).emit("chatFinished", {
        chatId: data.chatId,
        finishedBy: client.userId,
        operatorId: operatorIdToUse,
        reason: data.reason,
        timestamp: new Date(),
      })

      this.server.to("role:OPERADOR").emit("chatFinished", {
        chatId: data.chatId,
        finishedBy: client.userId,
        operatorId: operatorIdToUse,
        reason: data.reason,
        timestamp: new Date(),
      })

      this.sendOperatorDashboard(client)
      this.broadcastConnectedUsers()

      console.log(`✅ Chat ${data.chatId} finalizado por operador ${client.userId}`)
    } catch (error) {
      this.logger.error(`Error finalizando chat: ${error.message}`)
      console.error("🔥 [ChatGateway] Error stack:", error.stack)
      client.emit("error", { message: `Error finalizando chat: ${error.message}` })
    }
  }
// @UseGuards(WsRolesGuard)
// @Roles('CLIENT')
  @SubscribeMessage("rateChat")
  async handleRateChat(client: AuthenticatedSocket, data: RateChatDto) {
    console.log("⭐ [ChatGateway] rateChat called:", data)

    if (client.userRole !== "CLIENT") {
      client.emit("error", { message: "Solo clientes pueden calificar chats" })
      return
    }

    try {
      if (data.clientId !== client.userId) {
        client.emit("error", { message: "Solo puedes calificar tus propios chats" })
        return
      }

      console.log("⭐ [ChatGateway] Calling rateChatUseCase.execute")
      const rating = await this.rateChatUseCase.execute(data)

      this.server.to(`user:${data.operatorId}`).emit("chatRated", {
        chatId: data.chatId,
        rating: data.rating,
        comment: data.comment,
        categories: data.categories,
        clientId: data.clientId,
        timestamp: new Date(),
      })

      this.server.to("role:OPERADOR").emit("chatRated", {
        chatId: data.chatId,
        rating: data.rating,
        comment: data.comment,
        categories: data.categories,
        clientId: data.clientId,
        operatorId: data.operatorId,
        timestamp: new Date(),
      })

      client.emit("ratingSubmitted", {
        chatId: data.chatId,
        rating: data.rating,
        message: "¡Gracias por tu calificación!",
        timestamp: new Date(),
      })

      console.log(`⭐ Chat ${data.chatId} calificado con ${data.rating} estrellas`)
    } catch (error) {
      this.logger.error(`Error calificando chat: ${error.message}`)
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("joinChat")
  async handleJoinChat(client: AuthenticatedSocket, data: JoinChatDto) {
    console.log("📥 [ChatGateway] joinChat recibido:", data)

    if (!data.chatId) {
      this.logger.warn(`⚠️ chatId faltante en joinChat desde ${client.userId}`)
      client.emit("error", { message: "chatId es requerido para unirse al chat" })
      return
    }

    const chat = await this.chatRepository.getChatById(data.chatId)
    if (!chat) {
      this.logger.warn(`❌ Chat no encontrado con ID ${data.chatId}`)
      client.emit("error", { message: "Chat not found" })
      return
    }

    await client.join(`chat:${data.chatId}`)
    this.logger.log(`👤 Usuario ${client.userId} se unió al chat ${data.chatId}`)

    if (client.userRole === "OPERADOR") {
      const existingOperator = this.chatOperatorMap.get(data.chatId)
      if (!existingOperator && chat.specialistId) {
        this.chatOperatorMap.set(data.chatId, chat.specialistId)
        console.log(`🗺️ [ChatGateway] Mapeo actualizado: Chat ${data.chatId} -> Operador ${chat.specialistId}`)
      }

      const operatorChats = this.operatorChats.get(client.userId!) || []
      if (!operatorChats.includes(data.chatId)) {
        operatorChats.push(data.chatId)
        this.operatorChats.set(client.userId!, operatorChats)
        console.log(`📋 [ChatGateway] Chat ${data.chatId} agregado a operador ${client.userId}`)
      }
    }

    client.emit("joinedChat", {
      chatId: data.chatId,
      timestamp: new Date(),
    })

    const history = await this.chatRepository.getMessagesByChatId(data.chatId)
    client.emit("chatHistory", {
      chatId: data.chatId,
      messages: history.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.senderType,
        timestamp: msg.timestamp,
        chatId: msg.chatId,
        senderName: this.getSenderName(msg.senderType, msg.userId),
      })),
    })
  }

  @SubscribeMessage("getStats")
  async handleGetStats(client: AuthenticatedSocket) {
    if (client.userRole !== "OPERADOR") {
      client.emit("error", { message: "Solo operadores pueden ver estadísticas" })
      return
    }

    const stats = {
      connectedClients: Array.from(this.connectedUsers.values()).filter((u) => u.userRole === "CLIENT").length,
      connectedOperators: Array.from(this.connectedUsers.values()).filter((u) => u.userRole === "OPERADOR").length,
      totalActiveChats: Array.from(this.operatorChats.values()).reduce((sum, chats) => sum + chats.length, 0),
      operatorChats: this.operatorChats.get(client.userId!) || [],
      timestamp: new Date(),
    }

    client.emit("statsUpdate", stats)
  }

  @SubscribeMessage("leaveChat")
  async handleLeaveChat(client: AuthenticatedSocket, data: JoinChatDto) {
    await client.leave(`chat:${data.chatId}`)
    this.logger.log(`🚪 Usuario ${client.userId} salió del chat ${data.chatId}`)
  }

  @SubscribeMessage("typingStart")
  handleTypingStart(client: AuthenticatedSocket, data: { chatId: string }) {
    client.to(`chat:${data.chatId}`).emit("userTyping", {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: true,
    })
  }

  @SubscribeMessage("typingStop")
  handleTypingStop(client: AuthenticatedSocket, data: { chatId: string }) {
    client.to(`chat:${data.chatId}`).emit("userTyping", {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: false,
    })
  }

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

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId)
  }
}

// 🔧 FRASES DE ESCALAMIENTO MEJORADAS
const escalationTriggers = [
  "quiero hablar con alguien",
  "necesito ayuda real",
  "un operador",
  "una persona",
  "asesor",
  "humano",
  "quiero hablar con un humano",
  "hablar con alguien",
  "atención humana",
  "soporte humano",
  "operador humano",
]

function shouldEscalateToHuman(content: string): boolean {
  const lower = content.toLowerCase()
  const shouldEscalate = escalationTriggers.some((trigger) => lower.includes(trigger))
  console.log(`🔍 [shouldEscalateToHuman] Contenido: "${content}" -> Escalar: ${shouldEscalate}`)
  return shouldEscalate
}
