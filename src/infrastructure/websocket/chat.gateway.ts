
// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
//   WebSocketServer,
//   ConnectedSocket,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Inject, Logger } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';

// import { SendMessageUseCase } from 'src/aplication/chat/use-cases/send-message.use-case';
// import { CreateChatUseCase } from 'src/aplication/chat/use-cases/create-chat.use-case';
// import { AssignSpecialistUseCase } from 'src/aplication/chat/use-cases/assign-specialist.use-case';
// import { SendMessageDto } from 'src/aplication/chat/dto/send-message.dto';
// import { JoinChatDto } from 'src/aplication/chat/dto/join-chat.dto';
// import { LlamaApiService } from '../IA-llama/llama-api.service';
// import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
// import { CHAT_REPOSITORY } from 'src/domain/token/chat.repository.token';
// import { ChatRepository } from 'src/domain/chat/chat.repository.interface';

// interface AuthenticatedSocket extends Socket {
//   userId?: string;
//   userRole?: string;
// }

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:3002',
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
//     @Inject(CHAT_REPOSITORY)
//   private readonly chatRepository: ChatRepository,
//     private readonly sendMessageUseCase: SendMessageUseCase,
//     private readonly createChatUseCase: CreateChatUseCase,
//     private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
//     private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase,
//     private readonly llamaService: LlamaApiService,
//   ) {}

//   async handleConnection(client: AuthenticatedSocket) {
//     try {
//       const userId = client.handshake.query?.userId as string;
//       const roleRaw = client.handshake.query?.userRole;
//       const userRole = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw || 'CLIENT';

//       console.log('🔌 Conexión recibida:', { userId, userRole });

//       if (!userId) {
//         this.logger.warn(`Cliente ${client.id} desconectado: No userId provided`);
//         client.disconnect();
//         return;
//       }

//       client.userId = userId;
//       client.userRole = userRole;
//       this.connectedUsers.set(userId, client.id);

//       await client.join(`user:${userId}`);
//       await client.join(`role:${userRole}`);

//       this.logger.log(`✅ Usuario ${userId} conectado con socket ${client.id}`);
//       console.log('✅ Cliente conectado:', { userId, socketId: client.id });

//       if (userRole === 'CLIENT') {
//         this.server.to('role:SPECIALIST').emit('client-connected', {
//           userId,
//           timestamp: new Date(),
//         });
//       }
//     } catch (error) {
//       this.logger.error(`❌ Error en conexión: ${error.message}`);
//       client.disconnect();
//     }
//   }

//   handleDisconnect(client: AuthenticatedSocket) {
//     if (client.userId) {
//       this.connectedUsers.delete(client.userId);
//       this.logger.log(`🔌 Usuario ${client.userId} desconectado`);

//       if (client.userRole === 'CLIENT') {
//         this.server.to('role:SPECIALIST').emit('client-disconnected', {
//           userId: client.userId,
//           timestamp: new Date(),
//         });
//       }
//     }
//   }

//   @SubscribeMessage('createChat')
// async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
//   try {
//     if (!client.userId) {
//       throw new Error('userId is required to create a chat');
//     }
//     const chat = await this.createChatUseCase.execute({
//       userId: client.userId,
//       type: 'IA', // 🧠 Se fuerza que el primer contacto sea con el bot
//     });

//     client.emit('chatCreated', {
//       id: chat.id,
//       status: chat.status,
//       specialistId: chat.specialistId,
//       createdAt: chat.createdAt,
//       updatedAt: chat.updatedAt,
//     });

//     this.logger.log(`🆕 Chat ${chat.id} creado por usuario ${client.userId}`);

//     // ❌ Eliminar lógica de asignación automática como ya hablamos
//   } catch (error) {
//     this.logger.error(`❌ Error creando chat: ${error.message}`);
//     client.emit('error', { message: 'Error creando chat' });
//   }
// }
// @SubscribeMessage('sendMessage')
// async handleSendMessage(
//   @ConnectedSocket() client: AuthenticatedSocket,
//   @MessageBody() data: SendMessageDto,
// ) {
//   try {
//     const { chatId, content } = data;

//     if (!chatId) throw new Error('chatId está ausente en sendMessage');
//     if (!client.userId) throw new Error('userId ausente en socket');

//     // Guardar mensaje en DB
//     const allowedRoles = ["CLIENT", "SPECIALIST", "BOT", "AI", "SYSTEM"] as const;
//     const senderType = allowedRoles.includes(client.userRole as any)
//       ? client.userRole as typeof allowedRoles[number]
//       : "CLIENT";

//     const savedMessage = await this.sendMessageUseCase.execute(
//       client.userId,
//       chatId,
//       content,
//       undefined,
//       senderType,
//     );

//     // Emitir mensaje a la sala de chat
//     this.server.to(`chat:${chatId}`).emit('newMessage', {
//       ...savedMessage,
//       timestamp: new Date(),
//     });

//     // Obtener chat para ver tipo
//     const chat = await this.chatRepository.getChatById(chatId);
//     if (!chat) throw new Error("Chat no encontrado");

//     // Responder automáticamente si es chat IA
//     if (chat.type === 'IA') {
//       this.server.to(`chat:${chatId}`).emit('botThinking', { chatId });

//       const botResponse = await this.llamaService.generateMessage(content);

//       const botMessage = await this.sendMessageUseCase.execute(
//         'bot-id',
//         chatId,
//         botResponse,
//         client.userId,
//         'BOT',
//       );

//       // this.server.to(`chat:${chatId}`).emit('botResponse', {
//       //   chatId,
//       //   message: botResponse,
//       //   timestamp: new Date(),
//       // });

//       this.server.to(`chat:${chatId}`).emit('newMessage', {
//         ...botMessage,
//         timestamp: new Date(),
//       });
//     }

//     // Verificar si se debe escalar a humano
//     if (shouldEscalateToHuman(content)) {
//       try {
//         const operator = await this.assignOperatorUseCase.execute();
//         await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id);

//         // Unir socket del operador a la sala de chat
//         const operatorSocketId = this.connectedUsers.get(operator.id);
//         if (operatorSocketId) {
//           const operatorSocket = this.server.sockets.sockets.get(operatorSocketId);
//         if (operatorSocket) {
//   await operatorSocket.join(`chat:${chatId}`);
//   this.logger.log(`Operador ${operator.id} unido a la sala chat:${chatId}`);

//   // const history = await this.chatRepository.getMessagesByChatId(chatId);
//   // console.log("historial de mensajes",history);
//   // operatorSocket.emit('chatHistory', {
//   //   chatId,
//   //   messages: history,
//   // });
// const history = await this.chatRepository.getMessagesByChatId(data.chatId);
// client.emit('chatHistory', {
//   chatId: data.chatId,
//   messages: history,
// });

  
// }

//         } else {
//           this.logger.warn(`Operador ${operator.id} no está conectado, no se unió a la sala.`);
//         }

//         // Emitir evento especialista asignado y cambio de estado
//         this.emitSpecialistAssigned(chatId, operator.id);
//         this.emitChatStatusChange(chatId, 'ESCALATED');
//       } catch (assignErr) {
//         this.logger.warn(`No hay operadores disponibles para el chat ${chatId}`);
//         this.server.to(`chat:${chatId}`).emit('chatInQueue', {
//           chatId,
//           message: 'Actualmente no hay operadores disponibles. Estás en la cola de atención.',
//           timestamp: new Date(),
//         });
//       }
//     }

//     this.logger.log(`Mensaje enviado en chat ${chatId} por ${client.userId}`);
//   } catch (error) {
//     this.logger.error(`Error al enviar mensaje en chat ${data.chatId}: ${error.message}`);
//     client.emit('error', { message: 'Error enviando mensaje' });
//   }
// }

// @SubscribeMessage('joinChat')
// async handleJoinChat(
//   @ConnectedSocket() client: AuthenticatedSocket,
//   @MessageBody() data: JoinChatDto,
// ) {
//   console.log('📥 joinChat recibido:', data);

//   if (!data.chatId) {
//     this.logger.warn(`⚠️ chatId faltante en joinChat desde ${client.userId}`);
//     client.emit('error', { message: 'chatId es requerido para unirse al chat' });
//     return;
//   }

//   const chat = await this.chatRepository.getChatById(data.chatId);
//   if (!chat) {
//     this.logger.warn(`❌ Chat no encontrado con ID ${data.chatId}`);
//     client.emit('error', { message: 'Chat not found' });
//     return;
//   }

//   await client.join(`chat:${data.chatId}`);
//   this.logger.log(`👤 Usuario ${client.userId} se unió al chat ${data.chatId}`);

//   client.emit('joinedChat', {
//     chatId: data.chatId,
//     timestamp: new Date(),
//   });

//   // ✅ Emitir historial al cliente u operador
//   const history = await this.chatRepository.getMessagesByChatId(data.chatId);
//   client.emit('chatHistory', {
//     chatId: data.chatId,
//     messages: history.map((msg) => ({
//       id: msg.id,
//       content: msg.content,
//       sender: msg.senderType,
//       timestamp: msg.timestamp,
//       chatId: msg.chatId,
//       senderName: msg.senderType === 'BOT' ? 'IA' : msg.userId, // Mejorar si tenés nombre real
//     })),
//   });
// }
//   @SubscribeMessage('leaveChat')
//   async handleLeaveChat(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() data: JoinChatDto,
//   ) {
//     await client.leave(`chat:${data.chatId}`);
//     this.logger.log(`🚪 Usuario ${client.userId} salió del chat ${data.chatId}`);
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

// const escalationTriggers = [
//   'quiero hablar con alguien',
//   'necesito ayuda real',
//   'un operador',
//   'una persona',
//   'asesor',
//   'humano',
// ];

// function shouldEscalateToHuman(content: string): boolean {
//   const lower = content.toLowerCase();
//   return escalationTriggers.some(trigger => lower.includes(trigger));
// }









//-----------------------------PRUEBA DE CÓDIGO-----------------------------------


// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
//   WebSocketServer,
//   ConnectedSocket,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Inject, Logger } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';

// import { SendMessageUseCase } from 'src/aplication/chat/use-cases/send-message.use-case';
// import { CreateChatUseCase } from 'src/aplication/chat/use-cases/create-chat.use-case';
// import { AssignSpecialistUseCase } from 'src/aplication/chat/use-cases/assign-specialist.use-case';
// import { SendMessageDto } from 'src/aplication/chat/dto/send-message.dto';
// import { JoinChatDto } from 'src/aplication/chat/dto/join-chat.dto';
// import { LlamaApiService } from '../IA-llama/llama-api.service';
// import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
// import { CHAT_REPOSITORY } from 'src/domain/token/chat.repository.token';
// import { ChatRepository } from 'src/domain/chat/chat.repository.interface';

// interface AuthenticatedSocket extends Socket {
//   userId?: string;
//   userRole?: string;
// }

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:3002',
//     credentials: false,
//   },
//   namespace: '/chat',
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(ChatGateway.name);
//   private connectedUsers = new Map<string, string>(); // userId -> socketId

  // constructor(
  //   @Inject(CHAT_REPOSITORY)
  // private readonly chatRepository: ChatRepository,
  //   private readonly sendMessageUseCase: SendMessageUseCase,
  //   private readonly createChatUseCase: CreateChatUseCase,
  //   private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
  //   private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase,
  //   private readonly llamaService: LlamaApiService,
  // ) {}

//   async handleConnection(client: AuthenticatedSocket) {
//     try {
//       const userId = client.handshake.query?.userId as string
//       const roleRaw = client.handshake.query?.userRole
//       const userRole = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw || "CLIENT"

//       console.log("🔌 Conexión recibida:", { userId, userRole })

//       if (!userId) {
//         this.logger.warn(`Cliente ${client.id} desconectado: No userId provided`)
//         client.disconnect()
//         return
//       }

//       client.userId = userId
//       client.userRole = userRole
//       this.connectedUsers.set(userId, client.id)

//       await client.join(`user:${userId}`)
//       await client.join(`role:${userRole}`)

//       this.logger.log(`✅ Usuario ${userId} conectado con socket ${client.id}`)
//       console.log("✅ Cliente conectado:", { userId, socketId: client.id })

//       if (userRole === "CLIENT") {
//         this.server.to("role:SPECIALIST").emit("client-connected", {
//           userId,
//           timestamp: new Date(),
//         })
//       }
//     } catch (error) {
//       this.logger.error(`❌ Error en conexión: ${error.message}`)
//       client.disconnect()
//     }
//   }

//   handleDisconnect(client: AuthenticatedSocket) {
//     if (client.userId) {
//       this.connectedUsers.delete(client.userId)
//       this.logger.log(`🔌 Usuario ${client.userId} desconectado`)

//       if (client.userRole === "CLIENT") {
//         this.server.to("role:SPECIALIST").emit("client-disconnected", {
//           userId: client.userId,
//           timestamp: new Date(),
//         })
//       }
//     }
//   }

//   @SubscribeMessage('createChat')
//   async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
//     try {
//       if (!client.userId) {
//         throw new Error('userId is required to create a chat');
//       }
//       const chat = await this.createChatUseCase.execute({
//         userId: client.userId,
//         type: 'IA', // 🧠 Se fuerza que el primer contacto sea con el bot
//       });

//       client.emit('chatCreated', {
//         id: chat.id,
//         status: chat.status,
//         specialistId: chat.specialistId,
//         createdAt: chat.createdAt,
//         updatedAt: chat.updatedAt,
//       });

//       this.logger.log(`🆕 Chat ${chat.id} creado por usuario ${client.userId}`);
//     } catch (error) {
//       this.logger.error(`❌ Error creando chat: ${error.message}`);
//       client.emit('error', { message: 'Error creando chat' });
//     }
//   }

//   @SubscribeMessage("sendMessage")
//   async handleSendMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: SendMessageDto) {
//     try {
//       const { chatId, content } = data

//       if (!chatId) throw new Error("chatId está ausente en sendMessage")
//       if (!client.userId) throw new Error("userId ausente en socket")

//       // Guardar mensaje en DB
//       const allowedRoles = ["CLIENT", "SPECIALIST", "BOT", "AI", "SYSTEM"] as const
//       const senderType = allowedRoles.includes(client.userRole as any)
//         ? (client.userRole as (typeof allowedRoles)[number])
//         : "CLIENT"

//       const savedMessage = await this.sendMessageUseCase.execute(client.userId, chatId, content, undefined, senderType)

//       // Emitir mensaje a la sala de chat
//       this.server.to(`chat:${chatId}`).emit("newMessage", {
//         ...savedMessage,
//         timestamp: new Date(),
//       })

//       // Obtener chat para ver tipo y estado actual
//       const chat = await this.chatRepository.getChatById(chatId)
//       if (!chat) throw new Error("Chat no encontrado")

//       console.log("🔍 [DEBUG] Chat info:", {
//         chatId: chat.id,
//         type: chat.type,
//         specialistId: chat.specialistId,
//         hasSpecialist: !!(chat.specialistId && chat.specialistId !== null),
//         senderType: senderType,
//       })

//       // ✅ NUEVA LÓGICA: Solo responder con IA si NO hay especialista asignado
//       const hasSpecialist = chat.specialistId && chat.specialistId !== null
//       const isIAChat = chat.type === "IA"
//       const shouldBotRespond = isIAChat && !hasSpecialist && senderType === "CLIENT"

//       console.log("🤖 [DEBUG] Bot response decision:", {
//         isIAChat,
//         hasSpecialist,
//         senderType,
//         shouldBotRespond,
//       })

//       if (shouldBotRespond) {
//         console.log("🤖 Bot va a responder...")
//         this.server.to(`chat:${chatId}`).emit("botThinking", { chatId })

//         const botResponse = await this.llamaService.generateMessage(content)

//         const botMessage = await this.sendMessageUseCase.execute("bot-id", chatId, botResponse, client.userId, "BOT")

//         this.server.to(`chat:${chatId}`).emit("newMessage", {
//           ...botMessage,
//           timestamp: new Date(),
//         })
//       } else {
//         console.log("🚫 Bot NO va a responder porque:", {
//           isIAChat,
//           hasSpecialist,
//           senderType,
//         })
//       }

//       // Verificar si se debe escalar a humano (solo si aún no hay especialista)
//       if (shouldEscalateToHuman(content) && !hasSpecialist) {
//         console.log("🔄 Escalando a humano...")
//         try {
//           const operator = await this.assignOperatorUseCase.execute()

//           // ✅ ACTUALIZAR: Cambiar tipo de chat a HUMAN cuando se asigna operador
//           await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id)

//           // Unir socket del operador a la sala de chat
//           const operatorSocketId = this.connectedUsers.get(operator.id)
//           if (operatorSocketId) {
//             const operatorSocket = this.server.sockets.sockets.get(operatorSocketId)
//             if (operatorSocket) {
//               await operatorSocket.join(`chat:${chatId}`)
//               this.logger.log(`Operador ${operator.id} unido a la sala chat:${chatId}`)

//               const history = await this.chatRepository.getMessagesByChatId(chatId)
//               operatorSocket.emit("chatHistory", {
//                 chatId,
//                 messages: history,
//               })
//             }
//           } else {
//             this.logger.warn(`Operador ${operator.id} no está conectado, no se unió a la sala.`)
//           }

//           // Emitir eventos de asignación
//           this.emitSpecialistAssigned(chatId, operator.id)
//           this.emitChatStatusChange(chatId, "ESCALATED")

//           // ✅ MENSAJE DEL SISTEMA: Informar que ahora responde un humano
//           const systemMessage = await this.sendMessageUseCase.execute(
//             "system",
//             chatId,
//             "🎧 Un especialista se ha unido al chat. La IA ya no responderá automáticamente.",
//             undefined,
//             "SYSTEM",
//           )

//           this.server.to(`chat:${chatId}`).emit("newMessage", {
//             ...systemMessage,
//             timestamp: new Date(),
//           })

//           console.log("✅ Escalamiento completado")
//         } catch (assignErr) {
//           this.logger.warn(`No hay operadores disponibles para el chat ${chatId}`)
//           this.server.to(`chat:${chatId}`).emit("chatInQueue", {
//             chatId,
//             message: "Actualmente no hay operadores disponibles. Estás en la cola de atención.",
//             timestamp: new Date(),
//           })
//         }
//       }

//       this.logger.log(`Mensaje enviado en chat ${chatId} por ${client.userId}`)
//     } catch (error) {
//       this.logger.error(`Error al enviar mensaje en chat ${data.chatId}: ${error.message}`)
//       client.emit("error", { message: "Error enviando mensaje" })
//     }
//   }

//   @SubscribeMessage("joinChat")
//   async handleJoinChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
//     console.log("📥 joinChat recibido:", data)

//     if (!data.chatId) {
//       this.logger.warn(`⚠️ chatId faltante en joinChat desde ${client.userId}`)
//       client.emit("error", { message: "chatId es requerido para unirse al chat" })
//       return
//     }

//     const chat = await this.chatRepository.getChatById(data.chatId)
//     if (!chat) {
//       this.logger.warn(`❌ Chat no encontrado con ID ${data.chatId}`)
//       client.emit("error", { message: "Chat not found" })
//       return
//     }

//     await client.join(`chat:${data.chatId}`)
//     this.logger.log(`👤 Usuario ${client.userId} se unió al chat ${data.chatId}`)

//     client.emit("joinedChat", {
//       chatId: data.chatId,
//       timestamp: new Date(),
//     })

//     // ✅ Emitir historial al cliente u operador
//     const history = await this.chatRepository.getMessagesByChatId(data.chatId)
//     client.emit("chatHistory", {
//       chatId: data.chatId,
//       messages: history.map((msg) => ({
//         id: msg.id,
//         content: msg.content,
//         sender: msg.senderType,
//         timestamp: msg.timestamp,
//         chatId: msg.chatId,
//         senderName: msg.senderType === "BOT" ? "IA" : msg.userId, // Mejorar si tenés nombre real
//       })),
//     })
//   }

//   @SubscribeMessage("leaveChat")
//   async handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
//     await client.leave(`chat:${data.chatId}`)
//     this.logger.log(`🚪 Usuario ${client.userId} salió del chat ${data.chatId}`)
//   }

//   @SubscribeMessage("typingStart")
//   handleTypingStart(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
//     client.to(`chat:${data.chatId}`).emit("userTyping", {
//       userId: client.userId,
//       chatId: data.chatId,
//       isTyping: true,
//     })
//   }

//   @SubscribeMessage("typingStop")
//   handleTypingStop(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
//     client.to(`chat:${data.chatId}`).emit("userTyping", {
//       userId: client.userId,
//       chatId: data.chatId,
//       isTyping: false,
//     })
//   }

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

//   isUserConnected(userId: string): boolean {
//     return this.connectedUsers.has(userId)
//   }
// }

// const escalationTriggers = [
//   "quiero hablar con alguien",
//   "necesito ayuda real",
//   "un operador",
//   "una persona",
//   "asesor",
//   "humano",
// ]

// function shouldEscalateToHuman(content: string): boolean {
//   const lower = content.toLowerCase()
//   return escalationTriggers.some((trigger) => lower.includes(trigger))
// }




//-----------------------------PRUEBA DE CÓDIGO v2-----------------------------------

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Injectable, Logger } from '@nestjs/common';
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

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}
interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
}

interface ConnectedUser {
  userId: string
  socketId: string
  userRole: string
  connectedAt: Date
  currentChatId?: string
}

@WebSocketGateway({
  cors: {
    origin: "http://localhost:3001",
    credentials: false,
  },
  namespace: "/chat",
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ChatGateway.name)
  private connectedUsers = new Map<string, ConnectedUser>() // userId -> ConnectedUser
  private operatorChats = new Map<string, string[]>() // operatorId -> chatIds[]

  constructor(
    @Inject(CHAT_REPOSITORY)
  private readonly chatRepository: ChatRepository,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly createChatUseCase: CreateChatUseCase,
    private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
    private readonly assignSpecialistUseCaseToChat: AssignSpecialistUseCase,
    private readonly llamaService: LlamaApiService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.handshake.query?.userId as string
      const roleRaw = client.handshake.query?.userRole
      const userRole = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw || "CLIENT"

      console.log("🔌 Conexión recibida:", { userId, userRole })

      if (!userId) {
        this.logger.warn(`Cliente ${client.id} desconectado: No userId provided`)
        client.disconnect()
        return
      }

      client.userId = userId
      client.userRole = userRole

      // 🆕 Guardar información completa del usuario conectado
      const connectedUser: ConnectedUser = {
        userId,
        socketId: client.id,
        userRole,
        connectedAt: new Date(),
      }
      this.connectedUsers.set(userId, connectedUser)

      await client.join(`user:${userId}`)
      await client.join(`role:${userRole}`)

      this.logger.log(`✅ Usuario ${userId} conectado con socket ${client.id}`)

      // 🆕 Emitir lista actualizada de usuarios conectados a todos los operadores
      this.broadcastConnectedUsers()

      // 🆕 Si es operador, enviar su dashboard inicial
      if (userRole === "SPECIALIST") {
        await this.sendOperatorDashboard(client)
      }

      if (userRole === "CLIENT") {
        this.server.to("role:SPECIALIST").emit("client-connected", {
          userId,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      this.logger.error(`❌ Error en conexión: ${error.message}`)
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // 🆕 Remover de usuarios conectados
      this.connectedUsers.delete(client.userId)

      // 🆕 Limpiar chats del operador si es especialista
      if (client.userRole === "SPECIALIST") {
        this.operatorChats.delete(client.userId!)
      }

      this.logger.log(`🔌 Usuario ${client.userId} desconectado`)

      // 🆕 Actualizar lista de usuarios conectados
      this.broadcastConnectedUsers()

      if (client.userRole === "CLIENT") {
        this.server.to("role:SPECIALIST").emit("client-disconnected", {
          userId: client.userId,
          timestamp: new Date(),
        })
      }
    }
  }

  // 🆕 Enviar dashboard inicial al operador
  private async sendOperatorDashboard(client: AuthenticatedSocket) {
    const connectedClients = Array.from(this.connectedUsers.values()).filter((user) => user.userRole === "CLIENT")

    const operatorChats = this.operatorChats.get(client.userId!) || []

    client.emit("operatorDashboard", {
      connectedClients,
      assignedChats: operatorChats,
      totalConnectedUsers: this.connectedUsers.size,
      timestamp: new Date(),
    })
  }

  // 🆕 Broadcast lista de usuarios conectados a todos los operadores
  private broadcastConnectedUsers() {
    const connectedClients = Array.from(this.connectedUsers.values())
      .filter((user) => user.userRole === "CLIENT")
      .map((user) => ({
        userId: user.userId,
        connectedAt: user.connectedAt,
        currentChatId: user.currentChatId,
      }))

    const connectedOperators = Array.from(this.connectedUsers.values())
      .filter((user) => user.userRole === "SPECIALIST")
      .map((user) => ({
        userId: user.userId,
        connectedAt: user.connectedAt,
        activeChats: this.operatorChats.get(user.userId)?.length || 0,
      }))

    this.server.to("role:SPECIALIST").emit("connectedUsersUpdate", {
      clients: connectedClients,
      operators: connectedOperators,
      timestamp: new Date(),
    })
  }

  @SubscribeMessage('createChat')
  async handleMessage(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      if (!client.userId) {
        throw new Error('userId is required to create a chat');
      }
      const chat = await this.createChatUseCase.execute({
        userId: client.userId,
        type: 'IA',
      });

      // 🆕 Actualizar usuario conectado con chatId actual
      const connectedUser = this.connectedUsers.get(client.userId)
      if (connectedUser) {
        connectedUser.currentChatId = chat.id
        this.connectedUsers.set(client.userId, connectedUser)
      }

      client.emit('chatCreated', {
        id: chat.id,
        status: chat.status,
        specialistId: chat.specialistId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      });

      // 🆕 Actualizar dashboard de operadores
      this.broadcastConnectedUsers()

      this.logger.log(`🆕 Chat ${chat.id} creado por usuario ${client.userId}`);
    } catch (error) {
      this.logger.error(`❌ Error creando chat: ${error.message}`);
      client.emit('error', { message: 'Error creando chat' });
    }
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: SendMessageDto) {
    try {
      const { chatId, content } = data

      if (!chatId) throw new Error("chatId está ausente en sendMessage")
      if (!client.userId) throw new Error("userId ausente en socket")

      // Guardar mensaje en DB
      const allowedRoles = ["CLIENT", "SPECIALIST", "BOT", "AI", "SYSTEM"] as const
      const senderType = allowedRoles.includes(client.userRole as any)
        ? (client.userRole as (typeof allowedRoles)[number])
        : "CLIENT"

      const savedMessage = await this.sendMessageUseCase.execute(client.userId, chatId, content, undefined, senderType)

      // Emitir mensaje a la sala de chat
      this.server.to(`chat:${chatId}`).emit("newMessage", {
        ...savedMessage,
        timestamp: new Date(),
      })

      // Obtener chat para ver tipo y estado actual
      const chat = await this.chatRepository.getChatById(chatId)
      if (!chat) throw new Error("Chat no encontrado")

      console.log("🔍 [DEBUG] Chat info:", {
        chatId: chat.id,
        type: chat.type,
        specialistId: chat.specialistId,
        hasSpecialist: !!(chat.specialistId && chat.specialistId !== null),
        senderType: senderType,
      })

      // ✅ NUEVA LÓGICA: Solo responder con IA si NO hay especialista asignado
      const hasSpecialist = chat.specialistId && chat.specialistId !== null
      const isIAChat = chat.type === "IA"
      const shouldBotRespond = isIAChat && !hasSpecialist && senderType === "CLIENT"

      console.log("🤖 [DEBUG] Bot response decision:", {
        isIAChat,
        hasSpecialist,
        senderType,
        shouldBotRespond,
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

      // 🆕 ESCALAMIENTO AUTOMÁTICO MEJORADO
      if (shouldEscalateToHuman(content) && !hasSpecialist) {
        console.log("🔄 Escalando a humano automáticamente...")
        await this.autoAssignOperator(chatId, client.userId!)
      }

      this.logger.log(`Mensaje enviado en chat ${chatId} por ${client.userId}`)
    } catch (error) {
      this.logger.error(`Error al enviar mensaje en chat ${data.chatId}: ${error.message}`)
      client.emit("error", { message: "Error enviando mensaje" })
    }
  }

  // 🆕 AUTO-ASIGNACIÓN AUTOMÁTICA DE OPERADOR
  private async autoAssignOperator(chatId: string, clientId: string) {
    try {
      const operator = await this.assignOperatorUseCase.execute()

      // Actualizar chat con operador asignado
      await this.assignSpecialistUseCaseToChat.execute(chatId, operator.id)

      // 🆕 Agregar chat a la lista del operador
      const operatorChats = this.operatorChats.get(operator.id) || []
      operatorChats.push(chatId)
      this.operatorChats.set(operator.id, operatorChats)

      // 🆕 Auto-unir operador al chat si está conectado
      const operatorUser = this.connectedUsers.get(operator.id)
      if (operatorUser) {
        const operatorSocket = this.server.sockets.sockets.get(operatorUser.socketId)
        if (operatorSocket) {
          await operatorSocket.join(`chat:${chatId}`)

          // 🆕 Enviar historial y notificación automática al operador
          const history = await this.chatRepository.getMessagesByChatId(chatId)
          operatorSocket.emit("chatAutoAssigned", {
            chatId,
            clientId,
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

          // 🆕 Actualizar dashboard del operador
          this.sendOperatorDashboard(operatorSocket as AuthenticatedSocket)
        }
      }

      // Emitir eventos de asignación
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

      // 🆕 Actualizar lista de usuarios conectados
      this.broadcastConnectedUsers()

      console.log("✅ Escalamiento automático completado")
    } catch (assignErr) {
      this.logger.warn(`No hay operadores disponibles para el chat ${chatId}`)
      this.server.to(`chat:${chatId}`).emit("chatInQueue", {
        chatId,
        message: "⏳ Actualmente no hay operadores disponibles. Estás en la cola de atención.",
        timestamp: new Date(),
      })

      // 🆕 Notificar a todos los operadores sobre chat en cola
      this.server.to("role:SPECIALIST").emit("chatInQueue", {
        chatId,
        clientId,
        message: "⏳ Chat en cola esperando operador disponible",
        timestamp: new Date(),
      })
    }
  }

  // 🆕 Obtener nombre del remitente
  private getSenderName(senderType: string, userId: string): string {
    switch (senderType) {
      case "BOT":
        return "IA Assistant"
      case "CLIENT":
        return `Cliente ${userId}`
      case "SPECIALIST":
        return `Operador ${userId}`
      case "SYSTEM":
        return "Sistema"
      default:
        return userId
    }
  }

  @SubscribeMessage("joinChat")
  async handleJoinChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
    console.log("📥 joinChat recibido:", data)

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

    client.emit("joinedChat", {
      chatId: data.chatId,
      timestamp: new Date(),
    })

    // Emitir historial
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

  // 🆕 Nuevo endpoint para que operador marque chat como resuelto
  @SubscribeMessage("resolveChat")
  async handleResolveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
    if (client.userRole !== "SPECIALIST") {
      client.emit("error", { message: "Solo operadores pueden resolver chats" })
      return
    }

    try {
      const chat = await this.chatRepository.getChatById(data.chatId)
      if (!chat) {
        client.emit("error", { message: "Chat no encontrado" })
        return
      }

      // Cerrar chat
      const closedChat = chat.close()
      await this.chatRepository.updateChat(closedChat)

      // 🆕 Remover chat de la lista del operador
      const operatorChats = this.operatorChats.get(client.userId!) || []
      const updatedChats = operatorChats.filter((id) => id !== data.chatId)
      this.operatorChats.set(client.userId!, updatedChats)

      // Mensaje de cierre
      const systemMessage = await this.sendMessageUseCase.execute(
        "system",
        data.chatId,
        "✅ Chat resuelto y cerrado por el operador.",
        undefined,
        "SYSTEM",
      )

      this.server.to(`chat:${data.chatId}`).emit("newMessage", {
        ...systemMessage,
        timestamp: new Date(),
      })

      this.server.to(`chat:${data.chatId}`).emit("chatResolved", {
        chatId: data.chatId,
        resolvedBy: client.userId,
        timestamp: new Date(),
      })

      // 🆕 Actualizar dashboard
      this.sendOperatorDashboard(client)
      this.broadcastConnectedUsers()

      console.log(`✅ Chat ${data.chatId} resuelto por operador ${client.userId}`)
    } catch (error) {
      this.logger.error(`Error resolviendo chat: ${error.message}`)
      client.emit("error", { message: "Error resolviendo chat" })
    }
  }

  // 🆕 Obtener estadísticas en tiempo real
  @SubscribeMessage("getStats")
  async handleGetStats(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userRole !== "SPECIALIST") {
      client.emit("error", { message: "Solo operadores pueden ver estadísticas" })
      return
    }

    const stats = {
      connectedClients: Array.from(this.connectedUsers.values()).filter(u => u.userRole === "CLIENT").length,
      connectedOperators: Array.from(this.connectedUsers.values()).filter(u => u.userRole === "SPECIALIST").length,
      totalActiveChats: Array.from(this.operatorChats.values()).reduce((sum, chats) => sum + chats.length, 0),
      operatorChats: this.operatorChats.get(client.userId!) || [],
      timestamp: new Date(),
    }

    client.emit("statsUpdate", stats)
  }

  @SubscribeMessage("leaveChat")
  async handleLeaveChat(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: JoinChatDto) {
    await client.leave(`chat:${data.chatId}`)
    this.logger.log(`🚪 Usuario ${client.userId} salió del chat ${data.chatId}`)
  }

  @SubscribeMessage("typingStart")
  handleTypingStart(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
    client.to(`chat:${data.chatId}`).emit("userTyping", {
      userId: client.userId,
      chatId: data.chatId,
      isTyping: true,
    })
  }

  @SubscribeMessage("typingStop")
  handleTypingStop(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { chatId: string }) {
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

const escalationTriggers = [
  "quiero hablar con alguien",
  "necesito ayuda real",
  "un operador",
  "una persona",
  "asesor",
  "humano",
]

function shouldEscalateToHuman(content: string): boolean {
  const lower = content.toLowerCase()
  return escalationTriggers.some((trigger) => lower.includes(trigger))
}
