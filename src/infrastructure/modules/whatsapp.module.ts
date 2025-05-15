import { Module } from '@nestjs/common';
import { SendWhatsappMessageUseCase } from 'src/aplication/whatsapp/useCase/send-whatsapp-message.usecase';
import { WhatsappApiService } from '../whatsapp/whatsapp-api.service';


@Module({
  providers: [
    {
      provide: SendWhatsappMessageUseCase,
      useFactory: (whatsappService: WhatsappApiService) => {
        return new SendWhatsappMessageUseCase(whatsappService);
      },
      inject: [WhatsappApiService],
    },
    WhatsappApiService,
  ],
  exports: [SendWhatsappMessageUseCase],
})
export class WhatsappModule {}