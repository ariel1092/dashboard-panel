// src/infrastructure/controllers/test.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { SendWhatsappMessageUseCase } from 'src/aplication/whatsapp/useCase/send-whatsapp-message.usecase';


@Controller('test')
export class TestController {
  constructor(private readonly sendWhatsappMessageUseCase: SendWhatsappMessageUseCase) {}

  @Post('send-whatsapp')
  async sendMessage(@Body() body: { phone: string; message: string }) {
    await this.sendWhatsappMessageUseCase.execute(body.phone, body.message);
    return { status: 'message sent' };
  }
}
