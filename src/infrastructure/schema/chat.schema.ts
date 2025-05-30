import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"
import { ChatStatus } from "src/domain/chat/chat.entity"

export type ChatDocument = ChatModel & Document

@Schema({ timestamps: true })
export class ChatModel {
  @Prop({ required: true })
  _id: string

  @Prop({ enum: ChatStatus, default: ChatStatus.WAITING })
  status: ChatStatus

  @Prop()
  specialistId?: string

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel)

// Índices
ChatSchema.index({ status: 1 })
ChatSchema.index({ specialistId: 1 })
ChatSchema.index({ createdAt: -1 })
