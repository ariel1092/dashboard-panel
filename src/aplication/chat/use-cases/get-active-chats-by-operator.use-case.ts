import { Inject } from '@nestjs/common';
import { ChatRepository } from 'src/domain/chat/chat.repository.interface';
import { OperatorChatPreviewDto } from '../dto/operator-chat-preview.dto';
import { ClientRepository } from 'src/domain/clients/client-repository.interface';
import { MessageRepository } from 'src/domain/repositories/message.repository';
import { CHAT_REPOSITORY, MESSAGE_REPOSITORY } from 'src/domain/token/chat.repository.token';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';


export class GetActiveChatsByOperatorUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: ChatRepository,
   @Inject(MESSAGE_REPOSITORY) private readonly messageRepo: MessageRepository,
   @Inject(CLIENT_REPOSITORY) private readonly clientRepo: ClientRepository
  ) {}

async execute(operatorId: string): Promise<OperatorChatPreviewDto[]> {
  const chats = await this.chatRepository.findActiveChatsByOperator(operatorId)

return await Promise.all(
  chats.map(async chat => {
    const lastMessage = await this.messageRepo.findLastMessageByChatId(chat.id)
    const client = await this.clientRepo.findById(chat.id)

    return {
      chatId: chat.id,
      clientName: client?.name || 'Anónimo',
      lastMessage: lastMessage?.content || '',
      lastMessageAt: lastMessage?.timestamp || chat.createdAt,
      status: chat.status,
      type: chat.type || 'HUMAN',
    }
  }),
)
}
}
