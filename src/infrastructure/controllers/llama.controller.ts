import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { LlamaPromptDto } from 'src/domain/IA-llama/dto/llama-prompt.dto';
import { LlamaApiService } from 'src/infrastructure/IA-llama/llama-api.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { LlamaMessage } from 'src/domain/IA-llama/llama.service.port';


@ApiTags('Llama')
@Controller('llama')
export class LlamaController {
  constructor(private readonly llamaApiService: LlamaApiService) {}
 @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT', 'SPECIALIST')
@Post('chat')
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
  async chat(@Body('prompt')body: LlamaMessage[]) {
    const response = await this.llamaApiService.generateMessageFromHistory(body);
    return { response };
  }
}
