// import { Inject, Injectable } from "@nestjs/common"
// import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
// import type { ChatMessage } from "src/domain/chat/chat.entity"
// import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"

// @Injectable()
// export class GetMessagesUseCase {
//   constructor(
//      @Inject(CHAT_REPOSITORY)
//     private readonly repository: ChatRepository) {}

//   async execute(): Promise<ChatMessage[]> {
//     return this.repository.getMessages()
//   }

//   async executeByChat(chatId: string): Promise<ChatMessage[]> {
//     return this.repository.getMessagesByChatId(chatId)
//   }
// }





import { Inject, Injectable } from "@nestjs/common"
import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import type { ChatMessage } from "src/domain/chat/chat.entity"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"

@Injectable()
export class GetMessagesUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly repository: ChatRepository) {}

  async execute(): Promise<ChatMessage[]> {
    return this.repository.getMessages()
  }

  async executeByChat(chatId: string): Promise<ChatMessage[]> {
    return this.repository.getMessagesByChatId(chatId)
  }
}
