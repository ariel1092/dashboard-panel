

export interface CampaignServicePort {
  runCampaign(campaignId: string): Promise<void>;
}
