// client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Client as ClientEntity } from 'src/domain/clients/entities/client.entity';

export type ClientDocument = Client &
  Document & {
    toDomain: () => ClientEntity;
  };

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  name: string;

  @Prop({ default: 0 })
  interactions: number;

  @Prop({ type: Date , default:null } )
  lastContact: Date | null;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Date, default: null })
  lastInteraction: Date | null;
  
}

export const ClientSchema = SchemaFactory.createForClass(Client);

ClientSchema.methods.toDomain = function (): ClientEntity {
  return new ClientEntity(
    this._id.toString(),
    this.phone,
    this.name,
    this.interactions,
    this.lastContact,
    this.active,
    this.lastInteraction,
  );
};
