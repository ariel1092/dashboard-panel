import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type ChatRatingDocument = ChatRatingModel & Document

@Schema({ timestamps: true })
export class ChatRatingModel {
  @Prop({ required: true })
  chatId: string

  @Prop({ required: true })
  clientId: string

  @Prop({ required: true })
  operatorId: string

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop()
  comment?: string

  @Prop({
    type: {
      friendliness: { type: Number, min: 1, max: 5 },
      helpfulness: { type: Number, min: 1, max: 5 },
      responseTime: { type: Number, min: 1, max: 5 },
      problemResolution: { type: Number, min: 1, max: 5 },
    },
  })
  categories?: {
    friendliness: number
    helpfulness: number
    responseTime: number
    problemResolution: number
  }

  @Prop({ default: Date.now })
  createdAt: Date
}

export const ChatRatingSchema = SchemaFactory.createForClass(ChatRatingModel)

// Índices
ChatRatingSchema.index({ chatId: 1 }, { unique: true })
ChatRatingSchema.index({ operatorId: 1 })
ChatRatingSchema.index({ rating: 1 })
ChatRatingSchema.index({ createdAt: -1 })
