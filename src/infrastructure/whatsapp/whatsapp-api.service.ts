import { Injectable } from '@nestjs/common';
import { WhatsappServicePort } from '../../domain/whatsapp/whatsapp.service.port';

@Injectable()
export class WhatsappApiService implements WhatsappServicePort {
  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    // Aquí iría la lógica real con la API de Meta (axios, etc.)
    console.log(`[WhatsApp] Enviando a ${phoneNumber}: ${message}`);
  }
}