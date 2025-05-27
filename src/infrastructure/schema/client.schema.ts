// client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Client as ClientEntity } from 'src/domain/clients/entities/client.entity';

export type ClientDocument = Client &
  Document & {
    toDomain: () => ClientEntity;
  };

@Schema({
  timestamps: true,
  collection: 'clients',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Client {
  @Prop({ required: true, index: true })
  phone: string;

  @Prop()
  name: string;

  @Prop({ default: 0 })
  interactions: number;

  @Prop({ type: Date, default: null })
  lastContact: Date | null;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Date, default: null })
  lastInteraction: Date | null;
}

// Crear el esquema SOLO UNA VEZ
export const ClientSchema = SchemaFactory.createForClass(Client);

// Middleware para normalizar el teléfono antes de guardar
ClientSchema.pre('save', function(next) {
  if (this.isModified('phone')) {
    // Normalizar el teléfono eliminando caracteres no numéricos
    this.phone = this.phone ? this.phone.replace(/\D/g, '').trim() : '';
  }
  next();
});

// Crear un índice para el campo phone
ClientSchema.index({ phone: 1 });

// Método para convertir a entidad de dominio
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