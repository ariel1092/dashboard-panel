import { Module } from '@nestjs/common';
import { LlamaApiService } from '../IA-llama/llama-api.service';
import { GenerateMessageFromHistoryUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-bot-response.usecase';
import { GenerateMessageUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-message.usecase';

@Module({
  providers: [
    LlamaApiService,

    {
      provide: GenerateMessageFromHistoryUseCase,
      useFactory: (llamaApiService: LlamaApiService) => {
        return new GenerateMessageFromHistoryUseCase(llamaApiService);
      },
      inject: [LlamaApiService],
    },

    {
      provide: GenerateMessageUseCase,
      useFactory: (llamaApiService: LlamaApiService) => {
        return new GenerateMessageUseCase(llamaApiService);
      },
      inject: [LlamaApiService],
    },
  ],
  exports: [GenerateMessageFromHistoryUseCase, GenerateMessageUseCase],
})
export class LlamaIaModule {}
