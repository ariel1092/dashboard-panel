export interface LlamaServicePort {
    generateMessage(prompt: string): Promise<string>;
  }