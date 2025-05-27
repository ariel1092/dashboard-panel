import { Inject, Injectable } from '@nestjs/common';
import { ClientRepository } from 'src/domain/clients/client-repository.interface';
import { CLIENT_REPOSITORY } from 'src/domain/token/client.repository.token';
import { WHATSAPP_SERVICE } from 'src/domain/token/whatsapp-service.token';
import { WhatsappServicePort } from 'src/domain/whatsapp/whatsapp.service.port';


@Injectable()
export class SendMothersDayPromotionUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,

    @Inject(WHATSAPP_SERVICE)
    private readonly whatsappService: WhatsappServicePort,
  ) {}

  async execute(): Promise<void> {
    const clients = await this.clientRepository.findTop100WithRecentInteraction(); // Lo haremos en el repo

    for (const client of clients) {
      const message = `Hola ${client.name}, tenemos una promoción especial por el Día de la Madre 🎁. ¡No te la pierdas!`;
      await this.whatsappService.sendMessage(client.phone, message);
    }
  }
}
