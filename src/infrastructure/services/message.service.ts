// message.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SendMessageDto } from 'src/aplication/chat/dto/send-message.dto';
import { ChatMessageDocument } from '../schema/chat-message.schema';
import { ChatModel } from '../schema/chat.schema';


@Injectable()
export class MessageService {
  constructor(
    @InjectModel(ChatModel.name) private messageModel: Model<ChatMessageDocument>,
  ) {}

  async createMessage(sendMessageDto: SendMessageDto & { senderId: string }): Promise<ChatMessageDocument> {
    const message = new this.messageModel(sendMessageDto);
    return message.save();
  }

  async getChatMessages(chatId: string): Promise<ChatMessageDocument[]> {
    return this.messageModel
      .find({ chatId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 })
      .exec();
  }

  async markMessagesAsRead(chatId: string): Promise<void> {
    await this.messageModel.updateMany(
      { chatId, isRead: false },
      { isRead: true }
    ).exec();
  }

  async getUnreadCount(chatId: string): Promise<number> {
    return this.messageModel.countDocuments({ chatId, isRead: false }).exec();
  }

  // Crear mensaje automático del sistema
  async createSystemMessage(chatId: string, content: string): Promise<ChatMessageDocument> {
    const message = new this.messageModel({
      chatId,
      senderId: null, // Sistema
      content,
      type: 'system',
    });
    return message.save();
  }

  // Respuestas rápidas predefinidas
  async createQuickReply(chatId: string, senderId: string, template: string): Promise<ChatMessageDocument> {
    const quickReplies = {
      'greeting': '¡Hola! ¿En qué puedo ayudarte hoy?',
      'thanks': 'Gracias por contactarnos. ¿Hay algo más en lo que pueda ayudarte?',
      'wait': 'Un momento por favor, estoy revisando tu consulta.',
      'transfer': 'Voy a transferir tu consulta a un especialista que podrá ayudarte mejor.',
      'closing': 'Gracias por usar nuestro servicio de soporte. ¡Que tengas un buen día!',
    };

    const content = quickReplies[template] || template;
    
    const message = new this.messageModel({
      chatId,
      senderId,
      content,
      type: 'text',
      isQuickReply: true,
      quickReplyTemplate: template,
    });

    return message.save();
  }
}