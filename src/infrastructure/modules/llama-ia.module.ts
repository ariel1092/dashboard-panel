import { Module } from '@nestjs/common';
import { GenerateMessageUseCase } from 'src/aplication/IA-llama/use-case/use-cases/generate-message.usecase';
import { LlamaApiService } from '../IA-llama/llama-api.service';


@Module({
  providers: [
    {
      provide: GenerateMessageUseCase,
      useFactory: (llamaApiService: LlamaApiService) => {
        return new GenerateMessageUseCase(llamaApiService);
      },
      inject: [LlamaApiService],
    },
    LlamaApiService,
  ],
  exports: [GenerateMessageUseCase],
})
export class LlamaIaModule {}