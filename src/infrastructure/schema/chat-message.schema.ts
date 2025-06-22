import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type ChatMessageDocument = ChatMessageModel & Document

@Schema({ timestamps: true })
export class ChatMessageModel {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  chatId: string

  @Prop({ required: true })
  content: string

  @Prop()
  receiverId?: string

   @Prop({ required: true, enum: ["CLIENT", "SPECIALIST", "BOT", "AI", "SYSTEM"] })
  senderType: "CLIENT" | "SPECIALIST" | "BOT" | "AI" | "SYSTEM"

  @Prop({ default: false })
  isRead: boolean

  @Prop({ default: Date.now })
  timestamp: Date
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessageModel)

// Índices
ChatMessageSchema.index({ chatId: 1, timestamp: 1 })
ChatMessageSchema.index({ userId: 1 })
ChatMessageSchema.index({ receiverId: 1 })
ChatMessageSchema.index({ isRead: 1 })
