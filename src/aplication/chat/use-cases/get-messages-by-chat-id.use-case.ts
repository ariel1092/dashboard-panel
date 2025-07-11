import { Inject, Injectable } from "@nestjs/common"
import { ChatRepository } from "src/domain/chat/chat.repository.interface"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"

@Injectable()
export class GetMessagesByChatIdUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY)
    private readonly chatRepository: ChatRepository,
  ) {}

  async execute(chatId: string) {
    return this.chatRepository.getMessagesByChatId(chatId)
  }
}
