// // import { MongooseModule } from "@nestjs/mongoose"
// // import { Module } from "@nestjs/common"
// // import { ChatMessageModel, ChatMessageSchema } from "../schema/chat-message.schema"
// // import { ChatModel, ChatSchema } from "../schema/chat.schema"
// // import { ConnectedUserModel, ConnectedUserSchema } from "../schema/connected-user.schema"
// // import { ChatGateway } from "../websocket/chat.gateway"

// // import { MongoChatRepository } from "../repositories/mongo-chat.repository"
// // import { WsJwtGuard } from "../guards/ws-jwt.guard"
// // import { SendMessageUseCase } from "src/aplication/chat/use-cases/send-message.use-case"
// // import { GetMessagesUseCase } from "src/aplication/chat/use-cases/get-messages.use-case"
// // import { CreateChatUseCase } from "src/aplication/chat/use-cases/create-chat.use-case"
// // import { AssignSpecialistUseCase } from "src/aplication/chat/use-cases/assign-specialist.use-case"
// // import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"
// // import { LlamaApiService } from "../IA-llama/llama-api.service"
// // import { LlamaController } from "../controllers/llama.controller"
// // import { AssignOperatorToChatUseCase } from "src/aplication/operators/use-cases/assign-operator.use-case"
// // import { OperatorModule } from "./operator.module"

// // @Module({
// //   controllers: [LlamaController],
// // imports: [
// //   OperatorModule,
// //   MongooseModule.forFeature([
// //     { name: ChatMessageModel.name, schema: ChatMessageSchema },
// //     { name: ChatModel.name, schema: ChatSchema },
// //     { name: ConnectedUserModel.name, schema: ConnectedUserSchema },

// //   ]),
// // ],
// //   providers: [
// //     ChatGateway,
// //     SendMessageUseCase,
// //     GetMessagesUseCase,
// //     CreateChatUseCase,
// //     AssignSpecialistUseCase,
// //     WsJwtGuard,
// //     LlamaApiService,
// //     AssignOperatorToChatUseCase,

// //     {
// //       provide: CHAT_REPOSITORY,
// //       useClass: MongoChatRepository,
// //     },
// //   ],
// //   exports: [ChatGateway,SendMessageUseCase, GetMessagesUseCase, CreateChatUseCase, AssignSpecialistUseCase],
// // })
// // export class ChatModule {}

// import { MongooseModule } from '@nestjs/mongoose';
// import { Module } from '@nestjs/common';
// import {
//   ChatMessageModel,
//   ChatMessageSchema,
// } from '../schema/chat-message.schema';
// import { ChatModel, ChatSchema } from '../schema/chat.schema';
// import {
//   ConnectedUserModel,
//   ConnectedUserSchema,
// } from '../schema/connected-user.schema';
// import { ChatGateway } from '../websocket/chat.gateway';

// import { MongoChatRepository } from '../repositories/mongo-chat.repository';
// import { WsJwtGuard } from '../guards/ws-jwt.guard';
// import { SendMessageUseCase } from 'src/aplication/chat/use-cases/send-message.use-case';
// import { GetMessagesUseCase } from 'src/aplication/chat/use-cases/get-messages.use-case';
// import { CreateChatUseCase } from 'src/aplication/chat/use-cases/create-chat.use-case';
// import { AssignSpecialistUseCase } from 'src/aplication/chat/use-cases/assign-specialist.use-case';
// import { CHAT_REPOSITORY } from 'src/domain/token/chat.repository.token';
// import { LlamaApiService } from '../IA-llama/llama-api.service';
// import { LlamaController } from '../controllers/llama.controller';
// import { OperatorModule } from './operator.module';
// import { CHAT_RATING_REPOSITORY } from 'src/domain/token/chat-rating.repository.token';
// import { MongoChatRatingRepository } from '../repositories/mongo-chat-rating.repository';
// import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
// import { FinishChatUseCase } from 'src/aplication/chat/use-cases/finish-chat.use-case';
// import { ChatRatingModel, ChatRatingSchema } from '../schema/chat-rating.schema';
// import { GetOperatorStatsUseCase } from 'src/aplication/chat/use-cases/get-operator-stats.use-case';
// import { RateChatUseCase } from 'src/aplication/chat/use-cases/rate-chat.use-case';

// @Module({
//   controllers: [LlamaController],
//   imports: [
//     OperatorModule,
//     MongooseModule.forFeature([
//       { name: ChatMessageModel.name, schema: ChatMessageSchema },
//       { name: ChatModel.name, schema: ChatSchema },
//       { name: ConnectedUserModel.name, schema: ConnectedUserSchema },
//        { name: ChatRatingModel.name, schema: ChatRatingSchema },
   
//     ]),
//   ],
//   providers: [
//     // Repository
//     {
//       provide: CHAT_REPOSITORY,
//       useClass: MongoChatRepository,
//     },
//     {
//       provide: CHAT_RATING_REPOSITORY,
//       useClass: MongoChatRatingRepository,
//     },
//  // Use Cases
//     SendMessageUseCase,
//     GetMessagesUseCase,
//     CreateChatUseCase,
//     AssignSpecialistUseCase,
//     FinishChatUseCase,
//     RateChatUseCase,
//     GetOperatorStatsUseCase,

//     // Services
//     LlamaApiService,

//     // Gateway
//     ChatGateway,

//     // Guards
//     WsJwtGuard,
//     // Note: AssignOperatorToChatUseCase viene del OperatorModule
//   ],
//   exports: [
//     ChatGateway,
//     SendMessageUseCase,
//     GetMessagesUseCase,
//     CreateChatUseCase,
//     AssignSpecialistUseCase,
//     FinishChatUseCase,
//     RateChatUseCase,
//     GetOperatorStatsUseCase,
//     CHAT_REPOSITORY,
//     CHAT_RATING_REPOSITORY,
//     MongooseModule,
//   ],
// })
// export class ChatModule {}














// import { MongooseModule } from "@nestjs/mongoose"
// import { Module } from "@nestjs/common"
// import { ChatMessageModel, ChatMessageSchema } from "../schema/chat-message.schema"
// import { ChatModel, ChatSchema } from "../schema/chat.schema"
// import { ConnectedUserModel, ConnectedUserSchema } from "../schema/connected-user.schema"
// import { ChatRatingModel, ChatRatingSchema } from "../schema/chat-rating.schema"
// import { ChatGateway } from "../websocket/chat.gateway"

// import { MongoChatRepository } from "../repositories/mongo-chat.repository"
// import { MongoChatRatingRepository } from "../repositories/mongo-chat-rating.repository"
// import { WsJwtGuard } from "../guards/ws-jwt.guard"
// import { SendMessageUseCase } from "src/aplication/chat/use-cases/send-message.use-case"
// import { GetMessagesUseCase } from "src/aplication/chat/use-cases/get-messages.use-case"
// import { CreateChatUseCase } from "src/aplication/chat/use-cases/create-chat.use-case"
// import { AssignSpecialistUseCase } from "src/aplication/chat/use-cases/assign-specialist.use-case"
// import { FinishChatUseCase } from "src/aplication/chat/use-cases/finish-chat.use-case"
// import { RateChatUseCase } from "src/aplication/chat/use-cases/rate-chat.use-case"
// import { GetOperatorStatsUseCase } from "src/aplication/chat/use-cases/get-operator-stats.use-case"
// import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"
// import { CHAT_RATING_REPOSITORY } from "src/domain/token/chat-rating.repository.token"
// import { LlamaApiService } from "../IA-llama/llama-api.service"
// import { LlamaController } from "../controllers/llama.controller"
// import { OperatorModule } from "./operator.module"

// @Module({
//   controllers: [LlamaController],
//   imports: [
//     OperatorModule,
//     MongooseModule.forFeature([
//       { name: ChatMessageModel.name, schema: ChatMessageSchema },
//       { name: ChatModel.name, schema: ChatSchema },
//       { name: ConnectedUserModel.name, schema: ConnectedUserSchema },
//       { name: ChatRatingModel.name, schema: ChatRatingSchema },
//     ]),
//   ],
//   providers: [
//     // Repositories
//     {
//       provide: CHAT_REPOSITORY,
//       useClass: MongoChatRepository,
//     },
//     {
//       provide: CHAT_RATING_REPOSITORY,
//       useClass: MongoChatRatingRepository,
//     },

//     // Use Cases con factory functions para inyectar dependencias correctamente
//     SendMessageUseCase,
//     GetMessagesUseCase,
//     CreateChatUseCase,
//     AssignSpecialistUseCase,
//     {
//       provide: FinishChatUseCase,
//       useFactory: (chatRepository) => new FinishChatUseCase(chatRepository),
//       inject: [CHAT_REPOSITORY],
//     },
//     {
//       provide: RateChatUseCase,
//       useFactory: (ratingRepository) => new RateChatUseCase(ratingRepository),
//       inject: [CHAT_RATING_REPOSITORY],
//     },
//     {
//       provide: GetOperatorStatsUseCase,
//       useFactory: (ratingRepository) => new GetOperatorStatsUseCase(ratingRepository),
//       inject: [CHAT_RATING_REPOSITORY],
//     },

//     // Services
//     LlamaApiService,

//     // Gateway
//     ChatGateway,

//     // Guards
//     WsJwtGuard,

//     // Note: AssignOperatorToChatUseCase viene del OperatorModule
//   ],
//   exports: [
//     ChatGateway,
//     SendMessageUseCase,
//     GetMessagesUseCase,
//     CreateChatUseCase,
//     AssignSpecialistUseCase,
//     FinishChatUseCase,
//     RateChatUseCase,
//     GetOperatorStatsUseCase,
//     CHAT_REPOSITORY,
//     CHAT_RATING_REPOSITORY,
//   ],
// })
// export class ChatModule {}






import { MongooseModule } from "@nestjs/mongoose"
import { Module } from "@nestjs/common"
import { ChatMessageModel, ChatMessageSchema } from "../schema/chat-message.schema"
import { ChatModel, ChatSchema } from "../schema/chat.schema"
import { ConnectedUserModel, ConnectedUserSchema } from "../schema/connected-user.schema"
import { ChatRatingModel, ChatRatingSchema } from "../schema/chat-rating.schema"
import { ChatGateway } from "../websocket/chat.gateway"

import { MongoChatRepository } from "../repositories/mongo-chat.repository"
import { MongoChatRatingRepository } from "../repositories/mongo-chat-rating.repository"

import { SendMessageUseCase } from "src/aplication/chat/use-cases/send-message.use-case"
import { GetMessagesUseCase } from "src/aplication/chat/use-cases/get-messages.use-case"
import { CreateChatUseCase } from "src/aplication/chat/use-cases/create-chat.use-case"
import { AssignSpecialistUseCase } from "src/aplication/chat/use-cases/assign-specialist.use-case"
import { FinishChatUseCase } from "src/aplication/chat/use-cases/finish-chat.use-case"
import { RateChatUseCase } from "src/aplication/chat/use-cases/rate-chat.use-case"
import { GetOperatorStatsUseCase } from "src/aplication/chat/use-cases/get-operator-stats.use-case"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"
import { CHAT_RATING_REPOSITORY } from "src/domain/token/chat-rating.repository.token"
import { LlamaApiService } from "../IA-llama/llama-api.service"
import { LlamaController } from "../controllers/llama.controller"
import { OperatorModule } from "./operator.module"
import { WsRolesGuard } from "../guards/ws-jwt.guard"
import { JwtModule} from "@nestjs/jwt"
import { GetMessagesByChatIdUseCase } from "src/aplication/chat/use-cases/get-messages-by-chat-id.use-case"
import { ChatController } from "../controllers/chat.controller"

@Module({
  controllers: [LlamaController,ChatController],
  imports: [
     JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecreto',
      signOptions: { expiresIn: '4h' },
    }),
    OperatorModule,
    MongooseModule.forFeature([
      { name: ChatMessageModel.name, schema: ChatMessageSchema },
      { name: ChatModel.name, schema: ChatSchema },
      { name: ConnectedUserModel.name, schema: ConnectedUserSchema },
      { name: ChatRatingModel.name, schema: ChatRatingSchema },
    ]),
  ],
  providers: [
    // Repositories
    {
      provide: CHAT_REPOSITORY,
      useClass: MongoChatRepository,
    },
    {
      provide: CHAT_RATING_REPOSITORY,
      useClass: MongoChatRatingRepository,
    },

    // Use Cases
    SendMessageUseCase,
    GetMessagesUseCase,
    CreateChatUseCase,
    AssignSpecialistUseCase,
     GetMessagesByChatIdUseCase,

    {
      provide: FinishChatUseCase,
      useFactory: (chatRepository) => new FinishChatUseCase(chatRepository),
      inject: [CHAT_REPOSITORY],
    },
    {
      provide: RateChatUseCase,
      useFactory: (ratingRepository) => new RateChatUseCase(ratingRepository),
      inject: [CHAT_RATING_REPOSITORY],
    },
    {
      provide: GetOperatorStatsUseCase,
      useFactory: (ratingRepository) => new GetOperatorStatsUseCase(ratingRepository),
      inject: [CHAT_RATING_REPOSITORY],
    },

    // Services
    LlamaApiService,

    // Gateway
    ChatGateway,

    // Guards
   WsRolesGuard,
  ],
  exports: [
    ChatGateway,
    SendMessageUseCase,
    GetMessagesUseCase,
    CreateChatUseCase,
    AssignSpecialistUseCase,
    FinishChatUseCase,
    RateChatUseCase,
    GetOperatorStatsUseCase,
    CHAT_REPOSITORY,
    CHAT_RATING_REPOSITORY,
     GetMessagesByChatIdUseCase
  ],
})
export class ChatModule {}
