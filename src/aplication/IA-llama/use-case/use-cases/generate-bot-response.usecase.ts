
import { LlamaServicePort, LlamaMessage } from "src/domain/IA-llama/llama.service.port";

export class GenerateMessageFromHistoryUseCase {
  constructor(private readonly llamaService: LlamaServicePort) {}

  async execute(messages: LlamaMessage[]): Promise<string> {
    return this.llamaService.generateMessageFromHistory(messages);
  }
}
