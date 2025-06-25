// import { Injectable, Inject } from "@nestjs/common"
// import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
// import type { Chat } from "src/domain/chat/chat.entity"
// import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"


// @Injectable()
// export class AssignSpecialistUseCase {
//   constructor(
//     @Inject(CHAT_REPOSITORY) private readonly repository: ChatRepository,
//   ) {}

//   async execute(chatId: string, specialistId: string): Promise<Chat> {
//     const chat = await this.repository.getChatById(chatId)
//     if (!chat) {
//       throw new Error("Chat not found")
//     }

//     const updatedChat = chat.assignSpecialist(specialistId)
//     return await this.repository.updateChat(updatedChat)
//   }
// }



//------------------Prueba de asignar especialista------------------

import { Inject, Injectable } from "@nestjs/common"
import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import type { Chat } from "src/domain/chat/chat.entity"
import { CHAT_REPOSITORY } from "src/domain/token/chat.repository.token"

@Injectable()
export class AssignSpecialistUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly repository: ChatRepository,
  ) {}

  async execute(chatId: string, specialistId: string): Promise<Chat> {
    const chat = await this.repository.getChatById(chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    // ✅ Usar el método assignSpecialist que ya cambia el tipo a HUMAN
    const updatedChat = chat.assignSpecialist(specialistId)
    return await this.repository.updateChat(updatedChat)
  }
}
