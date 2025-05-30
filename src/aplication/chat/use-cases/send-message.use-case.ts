import { Inject, Injectable } from "@nestjs/common"
import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import { ChatMessage } from "src/domain/chat/chat.entity"

import { v4 as uuidv4 } from "uuid"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"


@Injectable()
export class SendMessageUseCase {
  constructor(
     @Inject(CHAT_REPOSITORY)
    private readonly repository: ChatRepository,
  ) {
  }

  async execute(userId: string, chatId: string, content: string, receiverId?: string): Promise<ChatMessage> {
    // Verificar que el chat existe
    const chat = await this.repository.getChatById(chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    const message = new ChatMessage(uuidv4(), userId, chatId, content, receiverId)

    return await this.repository.saveMessage(message)
  }
}
