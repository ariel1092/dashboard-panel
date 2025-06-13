// operator-status.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OperatorStatusDocument = OperatorStatus & Document;

@Schema({ timestamps: true })
export class OperatorStatus {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  operatorId: Types.ObjectId;

  @Prop({ enum: ['available', 'busy', 'away', 'offline'], default: 'offline' })
  status: string;

  @Prop({ default: 0 })
  activeChats: number;

  @Prop({ default: 5 })
  maxChats: number;

  @Prop()
  lastActivity: Date;
}

export const OperatorStatusSchema = SchemaFactory.createForClass(OperatorStatus);