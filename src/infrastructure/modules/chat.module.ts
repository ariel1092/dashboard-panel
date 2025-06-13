import { MongooseModule } from "@nestjs/mongoose"
import { Module } from "@nestjs/common"
import { ChatMessageModel, ChatMessageSchema } from "../schema/chat-message.schema"
import { ChatModel, ChatSchema } from "../schema/chat.schema"
import { ConnectedUserModel, ConnectedUserSchema } from "../schema/connected-user.schema"
import { ChatGateway } from "../websocket/chat.gateway"

import { MongoChatRepository } from "../repositories/mongo-chat.repository"
import { WsJwtGuard } from "../guards/ws-jwt.guard"
import { SendMessageUseCase } from "src/aplication/chat/use-cases/send-message.use-case"
import { GetMessagesUseCase } from "src/aplication/chat/use-cases/get-messages.use-case"
import { CreateChatUseCase } from "src/aplication/chat/use-cases/create-chat.use-case"
import { AssignSpecialistUseCase } from "src/aplication/chat/use-cases/assign-specialist.use-case"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"
import { LlamaApiService } from "../IA-llama/llama-api.service"
import { LlamaController } from "../controllers/llama.controller"
import { AssignOperatorToChatUseCase } from "src/aplication/operators/use-cases/assign-operator.use-case"

@Module({
  controllers: [LlamaController],
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessageModel.name, schema: ChatMessageSchema },
      { name: ChatModel.name, schema: ChatSchema },
      { name: ConnectedUserModel.name, schema: ConnectedUserSchema },
    ]),
  ],
  providers: [
    ChatGateway,
    SendMessageUseCase,
    GetMessagesUseCase,
    CreateChatUseCase,
    AssignSpecialistUseCase,
    WsJwtGuard,
    LlamaApiService,
    AssignOperatorToChatUseCase,
    
    {
      provide: CHAT_REPOSITORY,
      useClass: MongoChatRepository,
    },
  ],
  exports: [ChatGateway,SendMessageUseCase, GetMessagesUseCase, CreateChatUseCase, AssignSpecialistUseCase],
})
export class ChatModule {}
