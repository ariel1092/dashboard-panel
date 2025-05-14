// src/infrastructure/mongodb/schemas/client-interaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientInteractionDocument = ClientInteraction & Document;

@Schema({ timestamps: true })
export class ClientInteraction {
  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop()
  message: string;

  @Prop({ default: false })
  fromClient: boolean;
}

export const ClientInteractionSchema = SchemaFactory.createForClass(ClientInteraction);
