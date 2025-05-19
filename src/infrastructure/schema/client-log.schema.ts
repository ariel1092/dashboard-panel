import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Document } from 'mongoose';
import { ClientMini } from './client-mini.schema';

@Schema()
export class ClientLog {
  @Prop()
  message: string;

  @Prop()
  activeUpdated: number;

  @Prop()
  inactiveUpdated: number;

 @Prop({ type: [ClientMini] })
@Type(() => ClientMini)
activeClients: ClientMini[];

@Prop({ type: [ClientMini] })
@Type(() => ClientMini)
inactiveClients: ClientMini[];
  @Prop({ default: Date.now })
  date: Date;
}

export type ClientLogDocument = ClientLog & Document;
export const ClientLogSchema = SchemaFactory.createForClass(ClientLog);
