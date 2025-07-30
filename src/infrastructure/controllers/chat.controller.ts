import { Controller, Get, Param } from '@nestjs/common'

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatMessageDto } from 'src/aplication/chat/dto/chat-messages.dto'
import { GetMessagesByChatIdUseCase } from 'src/aplication/chat/use-cases/get-messages-by-chat-id.use-case'


@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly getMessagesByChatIdUseCase: GetMessagesByChatIdUseCase
  ) {}

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Obtener historial de mensajes de un chat por ID' })
  @ApiParam({ name: 'chatId', type: String, description: 'ID del chat' })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes del chat',
    type: ChatMessageDto,
    isArray: true,
  })
  async getChatMessages(@Param('chatId') chatId: string): Promise<ChatMessageDto[]> {
    const messages = await this.getMessagesByChatIdUseCase.execute(chatId)

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.senderType,
      timestamp: msg.timestamp,
      chatId: msg.chatId,
      userId: msg.userId,
      type: msg.type, 
    }))
  }
}
