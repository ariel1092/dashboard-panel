import { ChatRating } from "./chat-rating.entity"


export interface ChatRatingRepository {
  save(rating: ChatRating): Promise<ChatRating>
  findByChatId(chatId: string): Promise<ChatRating | null>
  findByOperatorId(operatorId: string): Promise<ChatRating[]>
  getAverageRatingByOperator(operatorId: string): Promise<number>
  getOverallStats(): Promise<{
    totalRatings: number
    averageRating: number
    ratingDistribution: { [key: number]: number }
  }>
}
