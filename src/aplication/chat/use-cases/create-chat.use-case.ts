import { Injectable, Inject } from "@nestjs/common"
import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import type { Chat } from "src/domain/chat/chat.entity"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"


@Injectable()
export class CreateChatUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly repository: ChatRepository,
  ) {}

  async execute(): Promise<Chat> {
    return await this.repository.createChat()
  }
}
