import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OperatorDocument = OperatorModel & Document;

@Schema({ timestamps: true }) // esto te da `createdAt` y `updatedAt` automáticos
export class OperatorModel {
  @Prop({ type: String })
_id: string;

  @Prop({ required: true })
  name: string;

@Prop({ required: true, unique: true, lowercase: true, trim: true })
email: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 0 })
  activeChats: number;

  @Prop({ default: Date.now })
  lastMessageTime: Date;
}

export const OperatorSchema = SchemaFactory.createForClass(OperatorModel);

// Índices útiles
OperatorSchema.index({ isAvailable: 1 });
OperatorSchema.index({ activeChats: 1 });
