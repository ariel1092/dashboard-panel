// src/infrastructure/campaigns/campaigns.module.ts

import { Module } from '@nestjs/common';
import { RunCampaignUseCase } from 'src/aplication/campaings/use-cases/run-campaign.usecase';
import { CampaignRunnerService } from '../campaings/campaign-runner.service';


@Module({
  providers: [
    {
      provide: RunCampaignUseCase,
      useFactory: (campaignRunner: CampaignRunnerService) => {
        return new RunCampaignUseCase(campaignRunner);
      },
      inject: [CampaignRunnerService],
    },
    CampaignRunnerService,
  ],
  exports: [RunCampaignUseCase],
})
export class CampaignsModule {}
