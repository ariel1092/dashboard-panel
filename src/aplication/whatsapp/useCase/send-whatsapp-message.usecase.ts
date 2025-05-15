
import { WhatsappServicePort } from '../../../domain/whatsapp/whatsapp.service.port';

export class SendWhatsappMessageUseCase {
  constructor(private readonly whatsappService: WhatsappServicePort) {}

  async execute(phone: string, message: string): Promise<void> {
    await this.whatsappService.sendMessage(phone, message);
  }
}