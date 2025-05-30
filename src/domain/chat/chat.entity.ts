export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly chatId: string,
    public readonly content: string,
    public readonly receiverId?: string,
    public readonly isRead: boolean = false,
    public readonly timestamp: Date = new Date(),
  ) {}

  markAsRead(): ChatMessage {
    return new ChatMessage(this.id, this.userId, this.chatId, this.content, this.receiverId, true, this.timestamp)
  }
}

export class Chat {
  constructor(
    public readonly id: string,
    public readonly status: ChatStatus,
    public readonly specialistId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  assignSpecialist(specialistId: string): Chat {
    return new Chat(this.id, ChatStatus.ACTIVE, specialistId, this.createdAt, new Date())
  }

  close(): Chat {
    return new Chat(this.id, ChatStatus.CLOSED, this.specialistId, this.createdAt, new Date())
  }
}

export enum ChatStatus {
  WAITING = "WAITING",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}
