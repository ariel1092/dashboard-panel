export interface WhatsappServicePort {
    sendMessage(phoneNumber: string, message: string): Promise<void>;
  }