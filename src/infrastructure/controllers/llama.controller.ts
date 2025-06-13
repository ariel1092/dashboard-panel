import { Controller, Post, Body } from '@nestjs/common';
import { LlamaApiService } from 'src/infrastructure/IA-llama/llama-api.service';

@Controller('llama')
export class LlamaController {
  constructor(private readonly llamaApiService: LlamaApiService) {}

  @Post('chat')
  async chat(@Body('prompt') prompt: string) {
    const response = await this.llamaApiService.generateMessage(prompt);
    return { response };
  }
}
