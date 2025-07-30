import { MessageType } from "src/aplication/chat/dto/send-message.dto"



export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly chatId: string,
    public readonly content: string,
    public readonly receiverId?: string,
    public readonly senderType: "CLIENT" | "OPERADOR" | "BOT" | "AI" | "SYSTEM" = "CLIENT",
    public readonly isRead: boolean = false,
    public readonly timestamp: Date = new Date(),
    public readonly type: MessageType = MessageType.TEXT,
    public readonly imageUrl?: string,
  ) {}

  markAsRead(): ChatMessage {
    return new ChatMessage(
      this.id,
      this.userId,
      this.chatId,
      this.content,
      this.receiverId,
      this.senderType,
      this.isRead,
      this.timestamp,
      this.type,
      this.imageUrl,
    )
  }
}

export class Chat {
  constructor(
    public readonly id: string,
    public readonly status: ChatStatus,
    public readonly specialistId?: string,
    public readonly type?: "IA" | "HUMAN", // nuevo
    public readonly userId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  assignSpecialist(specialistId: string): Chat {
    return new Chat(
      this.id,
      ChatStatus.ACTIVE,
      specialistId,
      "HUMAN", // ✅ Cambiar a HUMAN cuando se asigna especialista
      this.userId,
      this.createdAt,
      new Date(),
    )
  }
  close(): Chat {
    return new Chat(this.id, ChatStatus.CLOSED, this.specialistId, this.type, this.userId, this.createdAt, new Date())
  }
}

export enum ChatStatus {
  WAITING = "WAITING",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}
