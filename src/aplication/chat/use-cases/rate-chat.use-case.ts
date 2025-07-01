import { Inject, Injectable } from "@nestjs/common"

import type { ChatRatingRepository } from "src/domain/chat/chat-rating.repository.interface"
import type { RateChatDto } from "../dto/rate-chat.dto"
import { v4 as uuidv4 } from "uuid"
import { ChatRating } from "src/domain/chat/chat-rating.entity"
import { CHAT_RATING_REPOSITORY } from "src/domain/token/chat-rating.repository.token"

@Injectable()
export class RateChatUseCase {
  constructor(
    @Inject(CHAT_RATING_REPOSITORY)
    private readonly ratingRepository: ChatRatingRepository,
  ) {}

  async execute(dto: RateChatDto): Promise<ChatRating> {
    // Verificar si ya existe una calificación para este chat
    const existingRating = await this.ratingRepository.findByChatId(dto.chatId)
    if (existingRating) {
      throw new Error("This chat has already been rated")
    }

    const rating = new ChatRating(
      uuidv4(),
      dto.chatId,
      dto.clientId,
      dto.operatorId,
      dto.rating,
      dto.comment,
      dto.categories,
    )

    return await this.ratingRepository.save(rating)
  }
}
