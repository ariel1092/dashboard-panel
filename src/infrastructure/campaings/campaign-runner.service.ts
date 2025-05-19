import { Injectable } from '@nestjs/common';
import { CampaignServicePort } from '../../domain/campaigns/campaign.service.port';

@Injectable()
export class CampaignRunnerService implements CampaignServicePort {
  async runCampaign(campaignId: string): Promise<void> {
    // 🔄 Lógica real de ejecución de campaña va acá (placeholder por ahora)
    console.log(`[Campaign] Ejecutando campaña con ID: ${campaignId}`);
  }
}