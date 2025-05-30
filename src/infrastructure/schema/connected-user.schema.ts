import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type ConnectedUserDocument = ConnectedUserModel & Document

@Schema()
export class ConnectedUserModel {
  @Prop({ required: true, unique: true })
  userId: string

  @Prop({ required: true })
  socketId: string

  @Prop({ default: Date.now })
  connectedAt: Date
}

export const ConnectedUserSchema = SchemaFactory.createForClass(ConnectedUserModel)

// Índices
ConnectedUserSchema.index({ userId: 1 })
ConnectedUserSchema.index({ socketId: 1 })
