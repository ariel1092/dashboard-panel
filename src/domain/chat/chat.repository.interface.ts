import type { ChatMessage, Chat } from "./chat.entity"

export interface ChatRepository {
  // Mensajes
  saveMessage(message: ChatMessage): Promise<ChatMessage>
  getMessages(): Promise<ChatMessage[]>
  getMessagesByChatId(chatId: string): Promise<ChatMessage[]>
  markMessageAsRead(messageId: string): Promise<void>

  // Chats
  createChat(): Promise<Chat>
  getChatById(chatId: string): Promise<Chat | null>
  getChatsByUserId(userId: string): Promise<Chat[]>
  getChatsBySpecialistId(specialistId: string): Promise<Chat[]>
  updateChat(chat: Chat): Promise<Chat>

  // Usuarios conectados
  addConnectedUser(userId: string, socketId: string): Promise<void>
  removeConnectedUser(userId: string): Promise<void>
  getConnectedUsers(): Promise<{ userId: string; socketId: string }[]>
  isUserConnected(userId: string): Promise<boolean>
}
