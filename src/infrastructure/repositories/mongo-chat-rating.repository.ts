// import { Injectable } from "@nestjs/common"
// import type { Model } from "mongoose"

// import type { ChatRatingRepository } from "src/domain/chat/chat-rating.repository.interface"
// import type { ChatRatingDocument } from "../schema/chat-rating.schema"
// import { ChatRating } from "src/domain/chat/chat-rating.entity"
// import { InjectModel } from "@nestjs/mongoose"

// @Injectable()
// export class MongoChatRatingRepository implements ChatRatingRepository {
//   constructor(
//     @InjectModel(ChatRating.name)
//     private readonly ratingModel: Model<ChatRatingDocument>,
//   ) {}

//   async save(rating: ChatRating): Promise<ChatRating> {
//     const ratingData = {
//       chatId: rating.chatId,
//       clientId: rating.clientId,
//       operatorId: rating.operatorId,
//       rating: rating.rating,
//       comment: rating.comment,
//       categories: rating.categories,
//       createdAt: rating.createdAt,
//     }

//     const created = new this.ratingModel(ratingData)
//     const saved = await created.save()

//     return new ChatRating(
//       saved.id,
//       saved.chatId,
//       saved.clientId,
//       saved.operatorId,
//       saved.rating,
//       saved.comment,
//       saved.categories,
//       saved.createdAt,
//     )
//   }

//   async findByChatId(chatId: string): Promise<ChatRating | null> {
//     const doc = await this.ratingModel.findOne({ chatId }).lean()
//     if (!doc) return null

//     return new ChatRating(
//       doc._id.toString(),
//       doc.chatId,
//       doc.clientId,
//       doc.operatorId,
//       doc.rating,
//       doc.comment,
//       doc.categories,
//       doc.createdAt,
//     )
//   }

//   async findByOperatorId(operatorId: string): Promise<ChatRating[]> {
//     const docs = await this.ratingModel.find({ operatorId }).sort({ createdAt: -1 }).lean()

//     return docs.map(
//       (doc) =>
//         new ChatRating(
//           doc._id.toString(),
//           doc.chatId,
//           doc.clientId,
//           doc.operatorId,
//           doc.rating,
//           doc.comment,
//           doc.categories,
//           doc.createdAt,
//         ),
//     )
//   }

//   async getAverageRatingByOperator(operatorId: string): Promise<number> {
//     const result = await this.ratingModel.aggregate([
//       { $match: { operatorId } },
//       { $group: { _id: null, averageRating: { $avg: "$rating" } } },
//     ])

//     return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0
//   }

//   async getOverallStats(): Promise<{
//     totalRatings: number
//     averageRating: number
//     ratingDistribution: { [key: number]: number }
//   }> {
//     const [totalResult, avgResult, distributionResult] = await Promise.all([
//       this.ratingModel.countDocuments(),
//       this.ratingModel.aggregate([{ $group: { _id: null, averageRating: { $avg: "$rating" } } }]),
//       this.ratingModel.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
//     ])

//     const ratingDistribution: { [key: number]: number } = {}
//     for (let i = 1; i <= 5; i++) {
//       ratingDistribution[i] = 0
//     }

//     distributionResult.forEach((item) => {
//       ratingDistribution[item._id] = item.count
//     })

//     return {
//       totalRatings: totalResult,
//       averageRating: avgResult.length > 0 ? Math.round(avgResult[0].averageRating * 10) / 10 : 0,
//       ratingDistribution,
//     }
//   }
// }




import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"

import type { ChatRatingRepository } from "src/domain/chat/chat-rating.repository.interface"
import { ChatRatingModel, type ChatRatingDocument } from "../schema/chat-rating.schema"
import { ChatRating } from "src/domain/chat/chat-rating.entity"
import { InjectModel } from "@nestjs/mongoose"


@Injectable()
export class MongoChatRatingRepository implements ChatRatingRepository {
  constructor(
    @InjectModel(ChatRatingModel.name) 
    private readonly ratingModel: Model<ChatRatingDocument>,
  ) {}

  async save(rating: ChatRating): Promise<ChatRating> {
    const ratingData = {
      chatId: rating.chatId,
      clientId: rating.clientId,
      operatorId: rating.operatorId,
      rating: rating.rating,
      comment: rating.comment,
      categories: rating.categories,
      createdAt: rating.createdAt,
    }

    const created = new this.ratingModel(ratingData)
    const saved = await created.save()

    return new ChatRating(
      saved.id,
      saved.chatId,
      saved.clientId,
      saved.operatorId,
      saved.rating,
      saved.comment,
      saved.categories,
      saved.createdAt,
    )
  }

  async findByChatId(chatId: string): Promise<ChatRating | null> {
    const doc = await this.ratingModel.findOne({ chatId }).lean()
    if (!doc) return null

    return new ChatRating(
      doc._id.toString(),
      doc.chatId,
      doc.clientId,
      doc.operatorId,
      doc.rating,
      doc.comment,
      doc.categories,
      doc.createdAt,
    )
  }

  async findByOperatorId(operatorId: string): Promise<ChatRating[]> {
    const docs = await this.ratingModel.find({ operatorId }).sort({ createdAt: -1 }).lean()

    return docs.map(
      (doc) =>
        new ChatRating(
          doc._id.toString(),
          doc.chatId,
          doc.clientId,
          doc.operatorId,
          doc.rating,
          doc.comment,
          doc.categories,
          doc.createdAt,
        ),
    )
  }

  async getAverageRatingByOperator(operatorId: string): Promise<number> {
    const result = await this.ratingModel.aggregate([
      { $match: { operatorId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ])

    return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0
  }

  async getOverallStats(): Promise<{
    totalRatings: number
    averageRating: number
    ratingDistribution: { [key: number]: number }
  }> {
    const [totalResult, avgResult, distributionResult] = await Promise.all([
      this.ratingModel.countDocuments(),
      this.ratingModel.aggregate([{ $group: { _id: null, averageRating: { $avg: "$rating" } } }]),
      this.ratingModel.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ])

    const ratingDistribution: { [key: number]: number } = {}
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0
    }

    distributionResult.forEach((item) => {
      ratingDistribution[item._id] = item.count
    })

    return {
      totalRatings: totalResult,
      averageRating: avgResult.length > 0 ? Math.round(avgResult[0].averageRating * 10) / 10 : 0,
      ratingDistribution,
    }
  }
}
