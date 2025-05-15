
import { Injectable } from '@nestjs/common';
import { LlamaServicePort } from 'src/domain/IA-llama/llama.service.port';


@Injectable()
export class LlamaApiService implements LlamaServicePort {
  async generateMessage(prompt: string): Promise<string> {
    // Acá iría la lógica real de llamada a LLaMA (API local, HTTP, etc.)
    // Por ahora devolvemos un mock
    return `🧠 [MockLLaMA] Mensaje generado para: "${prompt}"`;
  }
}