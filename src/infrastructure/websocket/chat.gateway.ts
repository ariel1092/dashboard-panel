
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

import { JwtService } from '@nestjs/jwt';
import { OPERATOR_REPOSITORY } from 'src/domain/token/operator.token';
import { Operator } from 'src/domain/operators/entities/operator.entity';
import { OperatorRepository } from 'src/domain/operators/repositories/operator.repository';
import { LlamaMessage } from 'src/domain/IA-llama/llama.service.port';


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
// @UseGuards(WsRolesGuard) // Para proteger eventos, aunque el handleConnection no se protege con guard por defecto
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
  private activeSockets = new Map<string, Socket>();
  private operatorChats = new Map<string, string[]>();
  private chatOperatorMap = new Map<string, string>();

  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
    @Inject(OPERATOR_REPOSITORY)
    private readonly operatorRepository: OperatorRepository,
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
    console.log('🔌 [ChatGateway] Nueva conexión entrante. client.id:', client.id);
    console.log('📨 client.handshake.auth:', client.handshake.auth);
    console.log('📨 client.handshake.headers:', client.handshake.headers);

    const token = client.handshake.auth?.token;
    if (!token) {
      console.error('❌ Token no proporcionado en handshake.auth. Desconectando socket.');
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verify(token);
    console.log('✅ Token verificado en handleConnection:', payload);

    const userId = payload.sub || payload.id;
    const userRole = payload.role?.toUpperCase();

    if (!userId || !userRole) {
      console.warn(`⚠️ Cliente ${client.id} desconectado: Falta userId o role en payload`);
      console.warn('📦 Payload recibido:', payload);
      client.disconnect();
      return;
    }

    client.data.user = { sub: userId, role: userRole };
    client.userId = userId;
    client.userRole = userRole;

    console.log('🔒 client.data.user seteado:', client.data.user);

    // Verificamos si ya había una conexión anterior para este userId
    const existingConnection = this.connectedUsers.get(userId);
    if (existingConnection) {
      console.log(`🔄 Usuario ${userId} ya estaba conectado con socket ${existingConnection.socketId}`);

      const oldSocket = this.activeSockets.get(existingConnection.socketId);
      console.log('🔍 oldSocket encontrado:', !!oldSocket);

      // Si es otro socket distinto al actual, desconectamos el viejo para evitar conflictos
      if (oldSocket && oldSocket.id !== client.id) {
        oldSocket.disconnect();
        console.log(`✅ Socket anterior ${existingConnection.socketId} desconectado correctamente`);
      }
    }

    // Guardamos la nueva conexión
    const connectedUser: ConnectedUser = {
      userId,
      socketId: client.id,
      userRole,
      connectedAt: new Date(),
    };
    this.connectedUsers.set(userId, connectedUser);
    this.activeSockets.set(client.id, client);

    // Unimos al cliente a sus rooms individuales y por rol
    await client.join(`user:${userId}`);
    await client.join(`role:${userRole}`);

    console.log(`✅ Usuario ${userId} conectado con socket ${client.id}`);
    this.broadcastConnectedUsers();

  if (userRole === 'OPERADOR') {
  console.log('🎧 [ChatGateway] Operador conectado, validando en base de datos');
  
  // Buscar operador en BD sin crear uno nuevo
  console.log('[handleConnection] Buscando operador en BD con id:', userId);

  const operator = await this.operatorRepository.findById(userId);
  
  if (!operator) {
    console.warn(`[handleConnection] Operador no encontrado en BD: ${userId}. Desconectando socket.`);
    client.emit('error', 'Operador no autorizado o no existe');
    client.disconnect();
    return;
  }

  // Actualizar status solo si existe
  await this.operatorRepository.updateStatus(userId, true);
  console.log('📊 [ChatGateway] Enviando dashboard a operador');
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
    console.error('❌ Error en handleConnection:', error);
    this.logger.error(`❌ Error en conexión: ${error.message}`);
    client.disconnect();
  }
}

async handleDisconnect(client: AuthenticatedSocket) {
  const userId = client.userId;
  const userRole = client.userRole;

  console.log(`🔌 [ChatGateway] Usuario ${userId} desconectándose socketId: ${client.id}`);

  if (userId) {
    this.connectedUsers.delete(userId);
    console.log(`🗑️ [ChatGateway] Usuario ${userId} eliminado de connectedUsers`);
  }
  if (this.activeSockets.has(client.id)) {
    this.activeSockets.delete(client.id);
    console.log(`🗑️ [ChatGateway] Socket ${client.id} eliminado de activeSockets`);
  }

  if (userRole === 'OPERADOR') {
    console.log(`🎧 [ChatGateway] Operador ${userId} desconectado`);
  }

  this.logger.log(`🔌 Usuario ${userId} desconectado`);
  this.broadcastConnectedUsers();
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
    const { chatId, content } = data;

    if (!chatId) throw new Error("chatId está ausente en sendMessage");
    if (!client.userId) throw new Error("userId ausente en socket");

    const allowedRoles = ["CLIENT", "OPERADOR", "BOT", "AI", "SYSTEM"] as const;
    const senderType = allowedRoles.includes(client.userRole as any)
      ? (client.userRole as (typeof allowedRoles)[number])
      : "CLIENT";

    // Guardar el mensaje recibido
    const savedMessage = await this.sendMessageUseCase.execute(
      client.userId,
      chatId,
      content,
      undefined,
      senderType
    );

    // Emitir el mensaje a la sala del chat
    this.server.to(`chat:${chatId}`).emit("newMessage", {
      ...savedMessage,
      timestamp: new Date(),
    });

    // Obtener el chat para revisar su estado
    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) throw new Error("Chat no encontrado");

    const hasSpecialist = !!chat.specialistId;
    const isIAChat = chat.type === "IA";
    const shouldBotRespond = isIAChat && !hasSpecialist && senderType === "CLIENT";

    if (shouldBotRespond) {
      this.server.to(`chat:${chatId}`).emit("botThinking", { chatId });

      // Obtener historial de mensajes como contexto
      const messageHistory = await this.chatRepository.getMessagesByChatId(chatId);

      const llamaMessages: LlamaMessage[] = [
        {
          role: "system",
          content: this.llamaService.systemPrompt,
        },
        ...messageHistory.map((msg): LlamaMessage => ({
          role: msg.senderType === "BOT" || msg.senderType === "AI" ? "assistant" : "user",
          content: msg.content,
        })),
        {
          role: "user",
          content, // el mensaje actual del cliente
        },
      ];

      // Generar respuesta con IA
      const botResponse = await this.llamaService.generateMessageFromHistory(llamaMessages);

      // Guardar el mensaje del bot
      const botMessage = await this.sendMessageUseCase.execute(
        "bot-id",
        chatId,
        botResponse,
        client.userId,
        "BOT"
      );

      // Emitir al cliente
      this.server.to(`chat:${chatId}`).emit("newMessage", {
        ...botMessage,
        timestamp: new Date(),
      });
    }

    // Escalamiento a humano si aplica
    const shouldEscalate = shouldEscalateToHuman(content);
    if (shouldEscalate && !hasSpecialist) {
      await this.autoAssignOperator(chatId, client.userId!);
    }

    this.logger.log(`Mensaje enviado en chat ${chatId} por ${client.userId}`);
  } catch (error) {
    this.logger.error(`Error al enviar mensaje en chat ${data.chatId}: ${error.message}`);
    client.emit("error", { message: "Error enviando mensaje" });
  }
}




private async autoAssignOperator(chatId: string, clientId: string) {
  
  try {
    console.log(`🔄 [ChatGateway] Iniciando asignación automática para chat ${chatId}`);

    // Obtener operadores conectados vía WebSocket
    const connectedOperators = Array.from(this.connectedUsers.values()).filter(
      (user) => user.userRole === 'OPERADOR'
    );
    console.log(`🎧 [ChatGateway] Operadores conectados: ${connectedOperators.length}`);

    if (connectedOperators.length === 0) {
      throw new Error('No hay operadores conectados');
    }

    // Filtrar operadores disponibles según base de datos
    const availableConnectedOperators: Operator[] = [];
    console.log('🎧 Operadores disponibles:', availableConnectedOperators.map(op => ({ id: op.id, name: op.name })));

    for (const user of connectedOperators) {
      const operator = await this.operatorRepository.findById(user.userId);
      if (operator && operator.isAvailable && operator.state === 'AVAILABLE') {
        availableConnectedOperators.push(operator);
      }
    }

    if (availableConnectedOperators.length === 0) {
      throw new Error('No hay operadores disponibles entre los conectados');
    }

    // Seleccionar operador (lógica simple, primer disponible)
    const operator = availableConnectedOperators[0];
    console.log(`✅ [ChatGateway] Operador asignado:`, operator);

    // Ejecutar caso de uso para asignar operador al chat
    await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id);

    // Guardar mapeo chat -> operador
    this.chatOperatorMap.set(chatId, operator.id);
    console.log(`🗺️ [ChatGateway] Mapeo guardado: Chat ${chatId} -> Operador ${operator.id}`);

    // Añadir chat a la lista de chats activos del operador
    const operatorChats = this.operatorChats.get(operator.id) || [];
    operatorChats.push(chatId);
    this.operatorChats.set(operator.id, operatorChats);
    console.log(`📋 [ChatGateway] Chats del operador ${operator.id}:`, operatorChats);

    // Obtener socket actualizado del operador desde activeSockets
    const operatorUser = this.connectedUsers.get(operator.id);
    if (!operatorUser) {
      throw new Error(`No se encontró usuario conectado para operador ${operator.id}`);
    }

    console.log(`🔍 [ChatGateway] Buscando socket actualizado para operador:`, {
      operatorId: operator.id,
      socketId: operatorUser.socketId,
    });

    const operatorSocket = this.activeSockets.get(operatorUser.socketId);
    if (!operatorSocket) {
      this.logger.warn(`No se encontró socket para operador ${operator.id} con socketId ${operatorUser.socketId}`);
      return;
    }

    console.log(`🔌 [ChatGateway] Socket del operador encontrado:`, !!operatorSocket);

    // Unir operador al room del chat
    await operatorSocket.join(`chat:${chatId}`);
    console.log(`🏠 [ChatGateway] Operador unido al room chat:${chatId}`);

    // Obtener historial del chat para enviarlo al operador
    const history = await this.chatRepository.getMessagesByChatId(chatId);
    console.log(`📚 [ChatGateway] Historial del chat: ${history.length} mensajes`);

    // Emitir evento al operador con detalles del chat asignado
    operatorSocket.emit('chatAutoAssigned', {
      chatId,
      clientId,
      operatorId: operator.id,
      operatorName: operator.name,
      message: '🚨 Nuevo chat asignado automáticamente',
      history: history.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.senderType,
        timestamp: msg.timestamp,
        chatId: msg.chatId,
        senderName: this.getSenderName(msg.senderType, msg.userId),
      })),
      timestamp: new Date(),
    });
    console.log(`📤 [ChatGateway] Evento chatAutoAssigned enviado al operador ${operator.id}`);

    // Actualizar dashboard del operador
    await this.sendOperatorDashboard(operatorSocket as AuthenticatedSocket);

    // Notificar al cliente que el chat fue escalado a operador humano
    this.emitSpecialistAssigned(chatId, operator.id);
    this.emitChatStatusChange(chatId, 'ESCALATED');

    // Enviar mensaje del sistema al chat avisando que la IA ya no responderá
    const systemMessage = await this.sendMessageUseCase.execute(
      'system',
      chatId,
      `🎧 ${operator.name} se ha unido al chat. La IA ya no responderá automáticamente.`,
      undefined,
      'SYSTEM'
    );
    this.server.to(`chat:${chatId}`).emit('newMessage', {
      ...systemMessage,
      timestamp: new Date(),
    });

    // Notificar a todos los operadores que un chat fue asignado
    this.server.to('role:OPERADOR').emit('operatorAssigned', {
      chatId,
      clientId,
      operatorId: operator.id,
      operatorName: operator.name,
      timestamp: new Date(),
    });

    // Actualizar lista general de usuarios conectados
    this.broadcastConnectedUsers();

    console.log('✅ [ChatGateway] Escalamiento automático completado exitosamente');
  } catch (assignErr) {
    console.error(`❌ [ChatGateway] Error en asignación automática:`, assignErr);
    this.logger.warn(`No hay operadores disponibles para el chat ${chatId}: ${assignErr.message}`);

    // Notificar cliente que está en cola
    this.server.to(`chat:${chatId}`).emit('chatInQueue', {
      chatId,
      message: '⏳ Actualmente no hay operadores disponibles. Estás en la cola de atención.',
      timestamp: new Date(),
    });

    // Notificar operadores que hay un chat en cola
    this.server.to('role:OPERADOR').emit('chatInQueue', {
      chatId,
      clientId,
      message: '⏳ Chat en cola esperando operador disponible',
      timestamp: new Date(),
    });
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




//-----------------------prueba-----------------------




