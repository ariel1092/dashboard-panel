import { Inject, Injectable } from "@nestjs/common"
import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import type { Chat } from "src/domain/chat/chat.entity"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"





// @Injectable()
// export class CreateChatUseCase {
//   constructor(
//     @Inject(CHAT_REPOSITORY) private readonly repository: ChatRepository,
//   ) {}

@Injectable()
export class FinishChatUseCase {

  constructor(
      @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository) {
  
  }

  async execute(chatId: string, operatorId: string, reason?: string): Promise<Chat> {
    const chat = await this.chatRepository.getChatById(chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    if (chat.specialistId !== operatorId) {
      throw new Error("Only the assigned operator can finish this chat")
    }

    // Cerrar el chat
    const finishedChat = chat.close()
    return await this.chatRepository.updateChat(finishedChat)
  }
}
