// src/aplication/whatsapp/useCase/send-bulk-whatsapp-message.usecase.ts

import { Inject } from '@nestjs/common';
import { WHATSAPP_SERVICE } from 'src/domain/token/whatsapp-service.token';
import { WhatsappServicePort } from 'src/domain/whatsapp/whatsapp.service.port';


interface User {
  name: string;
  phone: string;
}

export class SendBulkWhatsappMessageUseCase {
  constructor(
    @Inject(WHATSAPP_SERVICE)
    private readonly whatsappService: WhatsappServicePort,
  ) {}

  async execute(users: User[], messageTemplate: string): Promise<void> {
    const sendTasks = users.map(user => {
      const personalizedMessage = messageTemplate.replace('{name}', user.name);
      return this.whatsappService.sendMessage(user.phone, personalizedMessage);
    });

    await Promise.all(sendTasks);
  }
}
