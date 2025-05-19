// src/infrastructure/controllers/test.controller.ts

import { Controller, Post, Body, Inject } from '@nestjs/common';
import { RunCampaignUseCase } from 'src/aplication/campaings/use-cases/run-campaign.usecase';
import { GenerateMessageUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-message.usecase';
import { UpdateClientStatusUseCase } from 'src/aplication/scheluder/use-case/update-client-status.usecase';
import { SendWhatsappMessageUseCase } from 'src/aplication/whatsapp/useCase/send-whatsapp-message.usecase';
import { MongoClientLogRepository } from '../repositories/mongo-client-log.repository';
import { CLIENT_LOG_REPOSITORY } from 'src/domain/token/client.repository.token';

@Controller('test')
export class TestController {
  constructor(
    private readonly sendWhatsappMessageUseCase: SendWhatsappMessageUseCase,
    private readonly generateMessageUseCase: GenerateMessageUseCase,
     private readonly runCampaignUseCase: RunCampaignUseCase,
       private readonly updateClientStatusUseCase: UpdateClientStatusUseCase,
     @Inject(CLIENT_LOG_REPOSITORY) private readonly clientLogRepository: MongoClientLogRepository
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
   @Post('run-campaign')
  async runCampaign(@Body() body: { campaignId: string }) {
    await this.runCampaignUseCase.execute(body.campaignId);
    return { status: 'campaign executed' };
  }
    @Post('update-client-status')
  async updateClientStatus() {
    await this.updateClientStatusUseCase.execute();
    return { status: 'client status updated' };
  }
 @Post('create-log')
async createLog(@Body() body: {
  message: string;
  activeUpdated: number;
  inactiveUpdated: number;
  activeClients?: { name: string; phone: string }[];
  inactiveClients?: { name: string; phone: string }[];
}) {
  try {
    console.log('📥 Request body:', body);
    
    await this.clientLogRepository.createLog({
      message: body.message,
      activeUpdated: body.activeUpdated,
      inactiveUpdated: body.inactiveUpdated,
      activeClients: body.activeClients ?? [],       
      inactiveClients: body.inactiveClients ?? []    
    });
    
    console.log('✅ Log creado con éxito');
    return { status: 'log created' };
  } catch (error) {
    console.error('❌ Error en create-log:', error);
    throw error;
  }
}

  
}
