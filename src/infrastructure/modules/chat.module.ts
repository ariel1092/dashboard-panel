

import { MongooseModule } from "@nestjs/mongoose"
import { forwardRef, Module } from "@nestjs/common"
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
import { CHAT_REPOSITORY, MESSAGE_REPOSITORY } from "src/domain/token/chat.repository.token"
import { CHAT_RATING_REPOSITORY } from "src/domain/token/chat-rating.repository.token"
import { LlamaApiService } from "../IA-llama/llama-api.service"
import { LlamaController } from "../controllers/llama.controller"
import { OperatorModule } from "./operator.module"
import { WsRolesGuard } from "../guards/ws-jwt.guard"
import { JwtModule} from "@nestjs/jwt"
import { GetMessagesByChatIdUseCase } from "src/aplication/chat/use-cases/get-messages-by-chat-id.use-case"
import { ChatController } from "../controllers/chat.controller"
import { GetActiveChatsByOperatorUseCase } from "src/aplication/chat/use-cases/get-active-chats-by-operator.use-case"
import { MongoMessageRepository } from "../repositories/mongo-message.repository"
import { CLIENT_REPOSITORY } from "src/domain/token/client.repository.token"
import { MongoClientRepository } from "../repositories/mongo-client.repository"
import { Client, ClientSchema } from "../schema/client.schema"

@Module({
  controllers: [LlamaController,ChatController],
  imports: [
     JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecreto',
      signOptions: { expiresIn: '4h' },
    }),
   forwardRef(() => OperatorModule),
    MongooseModule.forFeature([
      { name: ChatMessageModel.name, schema: ChatMessageSchema },
      { name: ChatModel.name, schema: ChatSchema },
      { name: ConnectedUserModel.name, schema: ConnectedUserSchema },
      { name: ChatRatingModel.name, schema: ChatRatingSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  providers: [
    // Repositories
    {
      provide: CHAT_REPOSITORY,
      useClass: MongoChatRepository,
    },
     {
      provide: MESSAGE_REPOSITORY,
      useClass: MongoMessageRepository,
    },
    {
      provide: CLIENT_REPOSITORY,
      useClass: MongoClientRepository,
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
     GetActiveChatsByOperatorUseCase,

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
     GetMessagesByChatIdUseCase,
     GetActiveChatsByOperatorUseCase,
     MESSAGE_REPOSITORY, CLIENT_REPOSITORY
  ],
})
export class ChatModule {}
