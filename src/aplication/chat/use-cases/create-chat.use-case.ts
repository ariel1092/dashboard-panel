// import { ChatRepository } from "src/domain/chat/chat.repository.interface";
// import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token";
// import { Inject, Injectable } from "@nestjs/common"
// import { Chat } from "src/domain/chat/chat.entity";

// interface CreateChatInput {
//   userId: string;
//   type?: 'IA' | 'HUMAN'; // o usá tu Enum `ChatType` si lo tenés
// }

// @Injectable()
// export class CreateChatUseCase {
//   constructor(
//     @Inject(CHAT_REPOSITORY) private readonly repository: ChatRepository,
//   ) {}

//   async execute(input: CreateChatInput): Promise<Chat> {
//     return await this.repository.createChat({
//       userId: input.userId,
//       type: input.type ?? 'IA', // default = IA
//       status: 'WAITING',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//   }
// }







import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"
import { Inject, Injectable } from "@nestjs/common"
import type { Chat } from "src/domain/chat/chat.entity"

interface CreateChatInput {
  userId: string
  type?: "IA" | "HUMAN" // o usá tu Enum `ChatType` si lo tenés
}

@Injectable()
export class CreateChatUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly repository: ChatRepository,
  ) {}
  async execute(input: CreateChatInput): Promise<Chat> {
    return await this.repository.createChat({
      userId: input.userId,
      type: input.type ?? "IA", // default = IA
      status: "WAITING",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

