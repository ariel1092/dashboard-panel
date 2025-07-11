export interface LlamaServicePort {
  generateMessageFromHistory(messages: LlamaMessage[]): Promise<string>;
}

export interface LlamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}