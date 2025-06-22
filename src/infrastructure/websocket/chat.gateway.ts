//---------------------------------ESTO FUNCIONA----------------------------------------------------

// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
//   WebSocketServer,
//   ConnectedSocket,
//   type OnGatewayConnection,
//   type OnGatewayDisconnect,
// } from "@nestjs/websockets"
// import type { Server, Socket } from "socket.io"
// import { UseGuards, Logger } from "@nestjs/common"

// import { SendMessageUseCase } from "src/aplication/chat/use-cases/send-message.use-case"
// import { CreateChatUseCase } from "src/aplication/chat/use-cases/create-chat.use-case"
// import { AssignSpecialistUseCase } from "src/aplication/chat/use-cases/assign-specialist.use-case"
// import { SendMessageDto } from "src/aplication/chat/dto/send-message.dto"
// import { JoinChatDto } from "src/aplication/chat/dto/join-chat.dto"
// import { WsJwtGuard } from "../guards/ws-jwt.guard"
// import { LlamaApiService } from "../IA-llama/llama-api.service"
// import { AssignOperatorToChatUseCase } from "src/aplication/operators/use-cases/assign-operator.use-case"

// interface AuthenticatedSocket extends Socket {
//   userId?: string
//   userRole?: string
// }

// @WebSocketGateway({
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   },
//   namespace: "/chat",
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server

//   private readonly logger = new Logger(ChatGateway.name)
//   private connectedUsers = new Map<string, string>() // userId -> socketId

//   constructor(
//    private readonly sendMessageUseCase: SendMessageUseCase,
//   private readonly createChatUseCase: CreateChatUseCase,
//   private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
//   private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase, // <- este
//   private readonly llamaService: LlamaApiService,
//   ) {}

//   async handleConnection(client: AuthenticatedSocket) {
//     try {
//       // Aquí deberías validar el JWT del cliente
//       // Por ahora, asumimos que el userId viene en el handshake
//       const userId = client.handshake.auth?.userId

//       const userRole = client.handshake.auth?.userRole || "CLIENT"

//       if (!userId) {
//         this.logger.warn(`Cliente ${client.id} desconectado: No userId provided`)
//         client.disconnect()
//         return
//       }

//       client.userId = userId
//       client.userRole = userRole

//       // Registrar usuario conectado
//       this.connectedUsers.set(userId, client.id)

//       // Unir a sala personal y sala de rol
//       await client.join(`user:${userId}`)
//       await client.join(`role:${userRole}`)

//       this.logger.log(`Usuario ${userId} conectado con socket ${client.id}`)

//       // Notificar conexión a especialistas si es cliente
//       if (userRole === "CLIENT") {
//         this.server.to("role:SPECIALIST").emit("client-connected", {
//           userId,
//           timestamp: new Date(),
//         })
//       }
//     } catch (error) {
//       this.logger.error(`Error en conexión: ${error.message}`)
//       client.disconnect()
//     }
//   }

//   handleDisconnect(client: AuthenticatedSocket) {
//     if (client.userId) {
//       this.connectedUsers.delete(client.userId)
//       this.logger.log(`Usuario ${client.userId} desconectado`)

//       // Notificar desconexión
//       if (client.userRole === "CLIENT") {
//         this.server.to("role:SPECIALIST").emit("client-disconnected", {
//           userId: client.userId,
//           timestamp: new Date(),
//         })
//       }
//       //handleMessage
//     }
//   }
// @SubscribeMessage('createChat')
// async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
//   try {
//     const chat = await this.createChatUseCase.execute();

//     client.emit('chatCreated', {
//       id: chat.id,
//       status: chat.status,
//       specialistId: chat.specialistId,
//       createdAt: chat.createdAt,
//       updatedAt: chat.updatedAt,
//     });

//     this.logger.log(`Chat ${chat.id} creado por usuario ${client.userId}`);

//     try {
//      const operator = await this.assignOperatorUseCase.execute(); // ✅ obtiene operador disponible

// const updatedChat = await this.assignSpecialistUseCaseToChat.execute(chat.id, operator.id); // ✅ asigna operador al chat

//       this.emitSpecialistAssigned(chat.id, operator.id);

//       this.logger.log(`🧑‍💼 Operador ${operator} asignado al chat ${chat.id}`);
//     } catch (assignErr) {
//       this.logger.warn(`🚨 No hay operadores disponibles para el chat ${chat.id}`);

//       this.server.to(`chat:${chat.id}`).emit("chatInQueue", {
//         chatId: chat.id,
//         message: "Actualmente no hay operadores disponibles. Estás en la cola de atención.",
//         timestamp: new Date(),
//       });
//     }

//   } catch (error) {
//     this.logger.error(`❌ Error creando chat: ${error.message}`);
//     client.emit('error', { message: 'Error creando chat' });
//   }
// }

//   @SubscribeMessage("joinChat")
//   // @UseGuards(WsJwtGuard)
//   async handleJoinChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
//     await client.join(`chat:${data.chatId}`)
//     this.logger.log(`Usuario ${client.userId} se unió al chat ${data.chatId}`)

//     client.emit("joinedChat", {
//       chatId: data.chatId,
//       timestamp: new Date(),
//     })
//   }

//   @SubscribeMessage("leaveChat")
//   // @UseGuards(WsJwtGuard)
//   async handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
//     await client.leave(`chat:${data.chatId}`)
//     this.logger.log(`Usuario ${client.userId} salió del chat ${data.chatId}`)
//   }

//   @SubscribeMessage("typingStart")
//   // @UseGuards(WsJwtGuard)
//   handleTypingStart(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
//     client.to(`chat:${data.chatId}`).emit("userTyping", {
//       userId: client.userId,
//       chatId: data.chatId,
//       isTyping: true,
//     })
//   }

//   @SubscribeMessage("typingStop")
//   // @UseGuards(WsJwtGuard)
//   handleTypingStop(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
//     client.to(`chat:${data.chatId}`).emit("userTyping", {
//       userId: client.userId,
//       chatId: data.chatId,
//       isTyping: false,
//     })
//   }

//   @SubscribeMessage('createChat')
//   // @UseGuards(WsJwtGuard)
//   async handleCreateChat(@ConnectedSocket() client: AuthenticatedSocket) {
//     try {
//       const chat = await this.createChatUseCase.execute();

//       client.emit('chatCreated', {
//         id: chat.id,
//         status: chat.status,
//         specialistId: chat.specialistId,
//         createdAt: chat.createdAt,
//         updatedAt: chat.updatedAt,
//       });

//       this.logger.log(`Chat ${chat.id} creado por usuario ${client.userId}`);
//     } catch (error) {
//       this.logger.error(`Error creando chat: ${error.message}`);
//       client.emit('error', { message: 'Error creando chat' });
//     }
//   }

//   // Métodos para emitir eventos desde los casos de uso
//   emitSpecialistAssigned(chatId: string, specialistId: string) {
//     this.server.to(`chat:${chatId}`).emit("specialistAssigned", {
//       chatId,
//       specialistId,
//       timestamp: new Date(),
//     })
//   }

//   emitChatStatusChange(chatId: string, status: string) {
//     this.server.to(`chat:${chatId}`).emit("chatStatusChanged", {
//       chatId,
//       status,
//       timestamp: new Date(),
//     })
//   }

//   // Verificar si un usuario está conectado
//   isUserConnected(userId: string): boolean {
//     return this.connectedUsers.has(userId)
//   }
// }

//---------------------------------------------------------------------------------------------------

// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
//   WebSocketServer,
//   ConnectedSocket,
//   type OnGatewayConnection,
//   type OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import type { Server, Socket } from 'socket.io';
// import { Logger } from '@nestjs/common';

// import { SendMessageUseCase } from 'src/aplication/chat/use-cases/send-message.use-case';
// import { CreateChatUseCase } from 'src/aplication/chat/use-cases/create-chat.use-case';
// import { AssignSpecialistUseCase } from 'src/aplication/chat/use-cases/assign-specialist.use-case';
// import { SendMessageDto } from 'src/aplication/chat/dto/send-message.dto';
// import { JoinChatDto } from 'src/aplication/chat/dto/join-chat.dto';
// import { LlamaApiService } from '../IA-llama/llama-api.service';
// import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';


// interface AuthenticatedSocket extends Socket {
//   userId?: string;
//   userRole?: string;
// }

// @WebSocketGateway({
//   cors: {
//     origin:'http://localhost:3002',
//     credentials: false,
//   },
//   namespace: '/chat',
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(ChatGateway.name);
//   private connectedUsers = new Map<string, string>(); // userId -> socketId

//   constructor(
//     private readonly sendMessageUseCase: SendMessageUseCase,
//     private readonly createChatUseCase: CreateChatUseCase,
//     private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
//     private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase,
//     private readonly llamaService: LlamaApiService,
//   ) {}

//   async handleConnection(client: AuthenticatedSocket) {
//     try {
//       const userId = client.handshake.query?.userId as string;
//       console.log('userId', userId);
  
//       let userRole = client.handshake.query?.userRole || 'CLIENT';
//       if (Array.isArray(userRole)) {
//         userRole = userRole[0];
//       }
//       console.log('userRole', userRole);

//       if (!userId) {
//         this.logger.warn(
//           `Cliente ${client.id} desconectado: No userId provided`,
//         );
//         client.disconnect();
//         return;
//       }

//       client.userId = userId;
//       client.userRole = userRole;

//       this.connectedUsers.set(userId, client.id);

//       await client.join(`user:${userId}`);
//       await client.join(`role:${userRole}`);
// console.log('este es el id del usuario conectado', userId);
// console.log('este es el id del socket conectado', client.id);
//       this.logger.log(`Usuario ${userId} conectado con socket ${client.id}`);


//       if (userRole === 'CLIENT') {
//         this.server.to('role:SPECIALIST').emit('client-connected', {
//           userId,
//           timestamp: new Date(),
//         });
//       }
//     } catch (error) {
//       this.logger.error(`Error en conexión: ${error.message}`);
//       client.disconnect();
//     }
//   }

//   handleDisconnect(client: AuthenticatedSocket) {
//     if (client.userId) {
//       this.connectedUsers.delete(client.userId);
//       this.logger.log(`Usuario ${client.userId} desconectado`);

//       if (client.userRole === 'CLIENT') {
//         this.server.to('role:SPECIALIST').emit('client-disconnected', {
//           userId: client.userId,
//           timestamp: new Date(),
//         });
//       }
//     }
//   }

//   @SubscribeMessage('createChat')
//   async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
//     try {
//       const chat = await this.createChatUseCase.execute();

//       client.emit('chatCreated', {
//         id: chat.id,
//         status: chat.status,
//         specialistId: chat.specialistId,
//         createdAt: chat.createdAt,
//         updatedAt: chat.updatedAt,
//       });

//       this.logger.log(`Chat ${chat.id} creado por usuario ${client.userId}`);

//       try {
//         const operator = await this.assignOperatorUseCase.execute();

//         const updatedChat = await this.assignSpecialistUseCaseToChat.execute(
//           chat.id,
//           operator.id,
//         );

//         this.emitSpecialistAssigned(chat.id, operator.id);

//         this.logger.log(
//           `🧑‍💼 Operador ${operator.id} asignado al chat ${chat.id}`,
//         );
//       } catch (assignErr) {
//         this.logger.warn(
//           `🚨 No hay operadores disponibles para el chat ${chat.id}`,
//         );

//         this.server.to(`chat:${chat.id}`).emit('chatInQueue', {
//           chatId: chat.id,
//           message:
//             'Actualmente no hay operadores disponibles. Estás en la cola de atención.',
//           timestamp: new Date(),
//         });
//       }
//     } catch (error) {
//       this.logger.error(`❌ Error creando chat: ${error.message}`);
//       client.emit('error', { message: 'Error creando chat' });
//     }
//   }

// @SubscribeMessage('sendMessage')
// async handleSendMessage(
//   @ConnectedSocket() client: AuthenticatedSocket,
//   @MessageBody() data: SendMessageDto,
// ) {
//   try {
//     const { chatId, content, receiverId } = data;

//     // Guardar el mensaje
//     if (!client.userId) {
//       throw new Error('User ID is missing from socket connection');
//     }
//     const savedMessage = await this.sendMessageUseCase.execute(
//       client.userId,
//       chatId,
//       content,
//       receiverId,
//     );

//     this.server.to(`chat:${chatId}`).emit('newMessage', {
//       ...savedMessage,
//       timestamp: new Date(),
//     });

//     this.logger.log(`💬 Mensaje enviado en chat ${chatId} por ${client.userId}`);

//     // Verificar si el mensaje sugiere escalar a humano
//     if (shouldEscalateToHuman(content)) {
//       this.logger.warn(`🚨 Escalando chat ${chatId} a operador humano por solicitud del usuario`);

//       // 1. Emitir aviso al cliente
//       this.server.to(`chat:${chatId}`).emit('escalateToHuman', {
//         chatId,
//         reason: 'El cliente ha solicitado hablar con un humano.',
//         timestamp: new Date(),
//       });

//       // 2. Obtener chat actualizado (revisar si ya tiene operador)
//       const chat = await this.sendMessageUseCase['repository'].getChatById(chatId); // Alternativamente, inyecta el repositorio en el gateway si prefieres

//       if (chat && !chat.specialistId) {
//         try {
//           const operator = await this.assignOperatorUseCase.execute();
//           const updatedChat = await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id);

//           this.emitSpecialistAssigned(chatId, operator.id);

//           this.logger.log(`✅ Operador ${operator.id} asignado automáticamente al chat ${chatId} tras solicitud del cliente`);
//         } catch (assignError) {
//           this.logger.warn(`❌ No se pudo asignar un operador al chat ${chatId} tras intento de escalamiento`);
//         }
//       }
//     }

//   } catch (error) {
//     this.logger.error(`❌ Error al enviar mensaje en chat ${data.chatId}: ${error.message}`);
//     client.emit('error', { message: 'Error enviando mensaje' });
//   }
// }


//   @SubscribeMessage('joinChat')
//   async handleJoinChat(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() data: JoinChatDto,
//   ) {
//     await client.join(`chat:${data.chatId}`);
//     this.logger.log(`Usuario ${client.userId} se unió al chat ${data.chatId}`);

//     client.emit('joinedChat', {
//       chatId: data.chatId,
//       timestamp: new Date(),
//     });
//   }

//   @SubscribeMessage('leaveChat')
//   async handleLeaveChat(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() data: JoinChatDto,
//   ) {
//     await client.leave(`chat:${data.chatId}`);
//     this.logger.log(`Usuario ${client.userId} salió del chat ${data.chatId}`);
//   }

//   @SubscribeMessage('typingStart')
//   handleTypingStart(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() data: { chatId: string },
//   ) {
//     client.to(`chat:${data.chatId}`).emit('userTyping', {
//       userId: client.userId,
//       chatId: data.chatId,
//       isTyping: true,
//     });
//   }

//   @SubscribeMessage('typingStop')
//   handleTypingStop(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() data: { chatId: string },
//   ) {
//     client.to(`chat:${data.chatId}`).emit('userTyping', {
//       userId: client.userId,
//       chatId: data.chatId,
//       isTyping: false,
//     });
//   }

//   emitSpecialistAssigned(chatId: string, specialistId: string) {
//     this.server.to(`chat:${chatId}`).emit('specialistAssigned', {
//       chatId,
//       specialistId,
//       timestamp: new Date(),
//     });
//   }

//   emitChatStatusChange(chatId: string, status: string) {
//     this.server.to(`chat:${chatId}`).emit('chatStatusChanged', {
//       chatId,
//       status,
//       timestamp: new Date(),
//     });
//   }

//   isUserConnected(userId: string): boolean {
//     return this.connectedUsers.has(userId);
//   }
// }



//---------------------------------esto es de prueba----------------------------------------------------


import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { SendMessageUseCase } from 'src/aplication/chat/use-cases/send-message.use-case';
import { CreateChatUseCase } from 'src/aplication/chat/use-cases/create-chat.use-case';
import { AssignSpecialistUseCase } from 'src/aplication/chat/use-cases/assign-specialist.use-case';
import { SendMessageDto } from 'src/aplication/chat/dto/send-message.dto';
import { JoinChatDto } from 'src/aplication/chat/dto/join-chat.dto';
import { LlamaApiService } from '../IA-llama/llama-api.service';
import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3002',
    credentials: false,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly createChatUseCase: CreateChatUseCase,
    private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
    private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase,
    private readonly llamaService: LlamaApiService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.handshake.query?.userId as string;
      const roleRaw = client.handshake.query?.userRole;
      const userRole = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw || 'CLIENT';

      console.log('🔌 Conexión recibida:', { userId, userRole });

      if (!userId) {
        this.logger.warn(`Cliente ${client.id} desconectado: No userId provided`);
        client.disconnect();
        return;
      }

      client.userId = userId;
      client.userRole = userRole;
      this.connectedUsers.set(userId, client.id);

      await client.join(`user:${userId}`);
      await client.join(`role:${userRole}`);

      this.logger.log(`✅ Usuario ${userId} conectado con socket ${client.id}`);
      console.log('✅ Cliente conectado:', { userId, socketId: client.id });

      if (userRole === 'CLIENT') {
        this.server.to('role:SPECIALIST').emit('client-connected', {
          userId,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`❌ Error en conexión: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`🔌 Usuario ${client.userId} desconectado`);

      if (client.userRole === 'CLIENT') {
        this.server.to('role:SPECIALIST').emit('client-disconnected', {
          userId: client.userId,
          timestamp: new Date(),
        });
      }
    }
  }

  @SubscribeMessage('createChat')
  async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const chat = await this.createChatUseCase.execute();

      client.emit('chatCreated', {
        id: chat.id,
        status: chat.status,
        specialistId: chat.specialistId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      });

      this.logger.log(`🆕 Chat ${chat.id} creado por usuario ${client.userId}`);

      try {
        const operator = await this.assignOperatorUseCase.execute();
        const updatedChat = await this.assignSpecialistUseCaseToChat.execute(chat.id, operator.id);

        this.emitSpecialistAssigned(chat.id, operator.id);
        this.logger.log(`🧑‍💼 Operador ${operator.id} asignado al chat ${chat.id}`);
      } catch (assignErr) {
        this.logger.warn(`🚨 No hay operadores disponibles para el chat ${chat.id}`);
        this.server.to(`chat:${chat.id}`).emit('chatInQueue', {
          chatId: chat.id,
          message: 'Actualmente no hay operadores disponibles. Estás en la cola de atención.',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`❌ Error creando chat: ${error.message}`);
      client.emit('error', { message: 'Error creando chat' });
    }
  }

//  @SubscribeMessage('sendMessage')
// async handleSendMessage(
//   @ConnectedSocket() client: AuthenticatedSocket,
//   @MessageBody() data: SendMessageDto,
// ) {
//   try {
//     const { chatId, content, receiverId } = data;

//     if (!chatId) throw new Error('chatId está ausente en sendMessage');
//     if (!client.userId) throw new Error('userId ausente en socket');

//     // 1. Guardar mensaje del usuario en la DB
//     const savedMessage = await this.sendMessageUseCase.execute(
//       client.userId,
//       chatId,
//       content,
//       receiverId,
//     );

//     // 2. Emitir mensaje solo al cliente que lo envió
//     client.emit('newMessage', {
//       ...savedMessage,
//       timestamp: new Date(),
//     });

//     // 3. Emitir mensaje a los demás usuarios del chat (sin duplicar en emisor)
//     client.broadcast.to(`chat:${chatId}`).emit('newMessage', {
//       ...savedMessage,
//       timestamp: new Date(),
//     });

//     this.logger.log(`💬 Mensaje enviado en chat ${chatId} por ${client.userId}`);

//     // 4. Verificar si el chat tiene specialist asignado
//     const chat = await this.sendMessageUseCase['repository'].getChatById(chatId);
//     const hasSpecialist = !!chat?.specialistId;

//     // 5. Si no tiene specialist, responder con IA
//     if (!hasSpecialist) {
//       // Emitir que el bot está pensando solo al cliente
//       client.emit('botThinking', { chatId });

//       // Obtener respuesta del bot (IA)
//       const botResponse = await this.llamaService.generateMessage(content);

//       // Emitir respuesta del bot solo al cliente
//       client.emit('botResponse', {
//         chatId,
//         message: botResponse,
//         timestamp: new Date(),
//       });

//       // Guardar respuesta del bot en DB
//       const botMessage = await this.sendMessageUseCase.execute(
//         'BOT',
//         chatId,
//         botResponse,
//         client.userId,
//       );

//       // Emitir mensaje del bot solo al cliente
//       client.emit('newMessage', {
//         ...botMessage,
//         timestamp: new Date(),
//       });

//       this.logger.log(`🤖 Bot respondió en chat ${chatId}`);
//     }

//     // 6. Escalamiento automático si el usuario pide humano
//     if (shouldEscalateToHuman(content)) {
//       this.logger.warn(`🚨 Escalando chat ${chatId} a humano`);
//       client.emit('escalateToHuman', {
//         chatId,
//         reason: 'El cliente ha solicitado hablar con un humano.',
//         timestamp: new Date(),
//       });

//       if (chat && !chat.specialistId) {
//         try {
//           const operator = await this.assignOperatorUseCase.execute();
//           await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id);
//           this.emitSpecialistAssigned(chatId, operator.id);
//           this.logger.log(`✅ Operador ${operator.id} asignado al chat ${chatId} tras solicitud`);
//         } catch (assignError) {
//           this.logger.warn(`❌ No se pudo asignar operador: ${assignError.message}`);
//         }
//       }
//     }
//   } catch (error) {
//     this.logger.error(`❌ Error al enviar mensaje en chat ${data.chatId}: ${error.message}`);
//     client.emit('error', { message: 'Error enviando mensaje' });
//   }
// }
@SubscribeMessage('sendMessage')
async handleSendMessage(
  @ConnectedSocket() client: AuthenticatedSocket,
  @MessageBody() data: SendMessageDto,
) {
  try {
    const { chatId, content, receiverId } = data;

    if (!chatId) throw new Error('chatId está ausente en sendMessage');
    if (!client.userId) throw new Error('userId ausente en socket');

// Guardar mensaje en DB
const allowedRoles = ["CLIENT", "SPECIALIST", "BOT", "AI", "SYSTEM"] as const;
const senderType = allowedRoles.includes(client.userRole as any)
  ? client.userRole as "CLIENT" | "SPECIALIST" | "BOT" | "AI" | "SYSTEM"
  : "CLIENT";
const savedMessage = await this.sendMessageUseCase.execute(
  client.userId,
  chatId,
  content,
  receiverId,
  senderType,
);

    // Emitir mensaje a TODOS los usuarios en la sala, incluido quien lo envió
    this.server.to(`chat:${chatId}`).emit('newMessage', {
      ...savedMessage,
      timestamp: new Date(),
    });

    //  client.broadcast.to(`chat:${chatId}`).emit('newMessage', {
    //   ...savedMessage,
    //   timestamp: new Date(),
    // });

    this.logger.log(`💬 Mensaje enviado en chat ${chatId} por ${client.userId}`);

    // Lógica IA y escalamiento humano omitida aquí para simplicidad
  } catch (error) {
    this.logger.error(`❌ Error al enviar mensaje en chat ${data.chatId}: ${error.message}`);
    client.emit('error', { message: 'Error enviando mensaje' });
  }
}



  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinChatDto,
  ) {
    console.log('📥 joinChat recibido:', data);

    if (!data.chatId) {
      this.logger.warn(`⚠️ chatId faltante en joinChat desde ${client.userId}`);
      client.emit('error', { message: 'chatId es requerido para unirse al chat' });
      return;
    }

    await client.join(`chat:${data.chatId}`);
    this.logger.log(`👤 Usuario ${client.userId} se unió al chat ${data.chatId}`);

    client.emit('joinedChat', {
      chatId: data.chatId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinChatDto,
  ) {
    await client.leave(`chat:${data.chatId}`);
    this.logger.log(`🚪 Usuario ${client.userId} salió del chat ${data.chatId}`);
  }

  @SubscribeMessage('typingStart')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.to(`chat:${data.chatId}`).emit('userTyping', {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typingStop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.to(`chat:${data.chatId}`).emit('userTyping', {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: false,
    });
  }

  emitSpecialistAssigned(chatId: string, specialistId: string) {
    this.server.to(`chat:${chatId}`).emit('specialistAssigned', {
      chatId,
      specialistId,
      timestamp: new Date(),
    });
  }

  emitChatStatusChange(chatId: string, status: string) {
    this.server.to(`chat:${chatId}`).emit('chatStatusChanged', {
      chatId,
      status,
      timestamp: new Date(),
    });
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

// Simula la lógica de detección para escalar a humano
function shouldEscalateToHuman(content: string): boolean {
  return content.toLowerCase().includes('humano') || content.toLowerCase().includes('operador');
}
