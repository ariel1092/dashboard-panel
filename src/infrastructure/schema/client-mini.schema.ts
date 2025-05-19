import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ClientMini {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;
}
export const ClientMiniSchema = SchemaFactory.createForClass(ClientMini);