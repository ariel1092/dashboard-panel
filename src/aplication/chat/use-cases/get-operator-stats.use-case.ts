import { Inject, Injectable } from "@nestjs/common"
import type { ChatRatingRepository } from "src/domain/chat/chat-rating.repository.interface"
import { CHAT_RATING_REPOSITORY } from "src/domain/token/chat-rating.repository.token"

@Injectable()
export class GetOperatorStatsUseCase {

  constructor(
    @Inject(CHAT_RATING_REPOSITORY)
    private readonly ratingRepository: ChatRatingRepository,
  ) {}

  async execute(operatorId: string) {
    const [ratings, averageRating, overallStats] = await Promise.all([
      this.ratingRepository.findByOperatorId(operatorId),
      this.ratingRepository.getAverageRatingByOperator(operatorId),
      this.ratingRepository.getOverallStats(),
    ])

    const totalChats = ratings.length
    const positiveRatings = ratings.filter((r) => r.isPositive()).length
    const negativeRatings = ratings.filter((r) => r.isNegative()).length

    return {
      operatorId,
      totalChats,
      averageRating,
      positiveRatings,
      negativeRatings,
      satisfactionRate: totalChats > 0 ? Math.round((positiveRatings / totalChats) * 100) : 0,
      recentRatings: ratings.slice(0, 10), // Últimas 10 calificaciones
      overallStats,
    }
  }
}
