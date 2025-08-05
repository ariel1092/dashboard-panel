import { ChatMessage } from "../chat/chat.entity";


export interface MessageRepository {
  findLastMessageByChatId(chatId: string): Promise<ChatMessage | null>;
}