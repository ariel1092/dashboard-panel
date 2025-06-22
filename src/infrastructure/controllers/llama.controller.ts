import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { LlamaPromptDto } from 'src/domain/IA-llama/dto/llama-prompt.dto';
import { LlamaApiService } from 'src/infrastructure/IA-llama/llama-api.service';


@ApiTags('Llama')
@Controller('llama')
export class LlamaController {
  constructor(private readonly llamaApiService: LlamaApiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Generar respuesta desde modelo Llama a partir de un prompt' })
  @ApiBody({ type: LlamaPromptDto })
  @ApiResponse({
    status: 200,
    description: 'Respuesta generada por el modelo',
    schema: {
      example: {
        response: 'El ácido hialurónico es una sustancia que se utiliza en tratamientos estéticos para hidratar y rellenar la piel.',
      },
    },
  })
  async chat(@Body('prompt') prompt: string) {
    const response = await this.llamaApiService.generateMessage(prompt);
    return { response };
  }
}
