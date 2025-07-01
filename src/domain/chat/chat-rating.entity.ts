export class ChatRating {
  constructor(
    public readonly id: string,
    public readonly chatId: string,
    public readonly clientId: string,
    public readonly operatorId: string,
    public readonly rating: number, // 1-5 estrellas
    public readonly comment?: string,
    public readonly categories?: {
      friendliness: number
      helpfulness: number
      responseTime: number
      problemResolution: number
    },
    public readonly createdAt: Date = new Date(),
  ) {}

  isPositive(): boolean {
    return this.rating >= 4
  }

  isNegative(): boolean {
    return this.rating <= 2
  }
}
