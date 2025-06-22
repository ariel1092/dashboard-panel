import { Controller, Post, Body, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { RunCampaignUseCase } from 'src/aplication/campaings/use-cases/run-campaign.usecase';
import { GenerateMessageUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-message.usecase';
import { UpdateClientStatusUseCase } from 'src/aplication/scheluder/use-case/update-client-status.usecase';
import { SendWhatsappMessageUseCase } from 'src/aplication/whatsapp/useCase/send-whatsapp-message.usecase';
import { MongoClientLogRepository } from '../repositories/mongo-client-log.repository';
import { CLIENT_LOG_REPOSITORY } from 'src/domain/token/client.repository.token';
import { FindClientsByDateUseCase } from 'src/aplication/clients/use-cases/find-clients-by-date.use-case';
import { SendMothersDayPromotionUseCase } from 'src/aplication/clients/use-cases/send-mothersday-promotion.usecase';

@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(
    private readonly sendWhatsappMessageUseCase: SendWhatsappMessageUseCase,
    private readonly generateMessageUseCase: GenerateMessageUseCase,
    private readonly runCampaignUseCase: RunCampaignUseCase,
    private readonly updateClientStatusUseCase: UpdateClientStatusUseCase,
    private readonly findClientsByDateUseCase: FindClientsByDateUseCase,
    private readonly sendMothersDayPromotionUseCase: SendMothersDayPromotionUseCase,
    @Inject(CLIENT_LOG_REPOSITORY)
    private readonly clientLogRepository: MongoClientLogRepository,
  ) {}

  @Post('send-whatsapp')
  @ApiOperation({ summary: 'Enviar un mensaje de WhatsApp a un número' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '5491134567890' },
        message: { type: 'string', example: 'Hola, esta es una prueba' },
      },
      required: ['phone', 'message'],
    },
  })
  @ApiResponse({ status: 201, description: 'Mensaje enviado con éxito' })
  async sendMessage(@Body() body: { phone: string; message: string }) {
    await this.sendWhatsappMessageUseCase.execute(body.phone, body.message);
    return { status: 'message sent' };
  }

  @Post('generate-message')
  @ApiOperation({ summary: 'Generar un mensaje usando IA (Llama)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', example: 'Escribe una respuesta amable para confirmar una cita' },
      },
      required: ['prompt'],
    },
  })
  async generateMessage(@Body() body: { prompt: string }) {
    const result = await this.generateMessageUseCase.execute(body.prompt);
    return { message: result };
  }

  @Post('run-campaign')
  @ApiOperation({ summary: 'Ejecutar una campaña por ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string', example: 'camp123' },
      },
      required: ['campaignId'],
    },
  })
  async runCampaign(@Body() body: { campaignId: string }) {
    await this.runCampaignUseCase.execute(body.campaignId);
    return { status: 'campaign executed' };
  }

  @Post('update-client-status')
  @ApiOperation({ summary: 'Actualizar el estado de todos los clientes automáticamente' })
  async updateClientStatus() {
    await this.updateClientStatusUseCase.execute();
    return { status: 'client status updated' };
  }

  @Post('create-log')
  @ApiOperation({ summary: 'Crear log de actualización masiva de clientes' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Actualización diaria' },
        activeUpdated: { type: 'number', example: 25 },
        inactiveUpdated: { type: 'number', example: 12 },
        activeClients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Juan Pérez' },
              phone: { type: 'string', example: '5491122334455' },
            },
          },
        },
        inactiveClients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Ana Gómez' },
              phone: { type: 'string', example: '5491199988877' },
            },
          },
        },
      },
      required: ['message', 'activeUpdated', 'inactiveUpdated'],
    },
  })
  async createLog(@Body() body: {
    message: string;
    activeUpdated: number;
    inactiveUpdated: number;
    activeClients?: { name: string; phone: string }[];
    inactiveClients?: { name: string; phone: string }[];
  }) {
    await this.clientLogRepository.createLog({
      message: body.message,
      activeUpdated: body.activeUpdated,
      inactiveUpdated: body.inactiveUpdated,
      activeClients: body.activeClients ?? [],
      inactiveClients: body.inactiveClients ?? [],
    });
    return { status: 'log created' };
  }

  @Post('clients-by-date')
  @ApiOperation({ summary: 'Buscar clientes por fecha y límite' })
  @ApiQuery({ name: 'limit', type: String, example: '100', required: true })
  @ApiQuery({ name: 'date', type: String, example: '2025-06-01', required: true })
  async getClientsByDate(@Query('limit') limit: string, @Query('date') date: string) {
    const parsedDate = new Date(date);
    const parsedLimit = parseInt(limit, 10);
    const clients = await this.findClientsByDateUseCase.execute(parsedLimit, parsedDate);
    return clients;
  }

  @Post('send-mothersday-promo')
  @ApiOperation({ summary: 'Enviar promoción especial por el Día de la Madre' })
  async sendPromo() {
    await this.sendMothersDayPromotionUseCase.execute();
    return { status: 'Mothers day promotion sent to 100 users' };
  }
}
