
import { CampaignServicePort } from '../../../domain/campaigns/campaign.service.port';

export class RunCampaignUseCase {
  constructor(private readonly campaignService: CampaignServicePort) {}

  async execute(campaignId: string): Promise<void> {
    await this.campaignService.runCampaign(campaignId);
  }
}