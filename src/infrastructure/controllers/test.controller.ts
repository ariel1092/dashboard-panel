// src/infrastructure/controllers/test.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { GenerateMessageUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-message.usecase';
import { SendWhatsappMessageUseCase } from 'src/aplication/whatsapp/useCase/send-whatsapp-message.usecase';

@Controller('test')
export class TestController {
  constructor(
    private readonly sendWhatsappMessageUseCase: SendWhatsappMessageUseCase,
    private readonly generateMessageUseCase: GenerateMessageUseCase
  ) {}
  @Post('send-whatsapp')
  async sendMessage(@Body() body: { phone: string; message: string }) {
    await this.sendWhatsappMessageUseCase.execute(body.phone, body.message);
    return { status: 'message sent' };
  }
  @Post('generate-message')
  async generateMessage(@Body() body: { prompt: string }) {
    const result = await this.generateMessageUseCase.execute(body.prompt);
    return { message: result };
  }
}
