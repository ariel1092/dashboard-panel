import { LlamaServicePort } from "src/domain/IA-llama/llama.service.port";

export class GenerateMessageUseCase {
  constructor(private readonly llamaService: LlamaServicePort) {}

  async execute(prompt: string): Promise<string> {
    return this.llamaService.generateMessage(prompt);
  }
}