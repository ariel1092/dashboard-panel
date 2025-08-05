import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ChatMessageDocument, ChatMessageModel } from '../schema/chat-message.schema';
import { ChatMessage } from 'src/domain/chat/chat.entity';
import { MessageRepository } from 'src/domain/repositories/message.repository';
import { MessageType } from 'src/aplication/chat/dto/send-message.dto';



@Injectable()
export class MongoMessageRepository implements MessageRepository {
  constructor(
    @InjectModel(ChatMessageModel.name)
    private readonly messageModel: Model<ChatMessageDocument>,
  ) {}

 async findLastMessageByChatId(chatId: string): Promise<ChatMessage | null> {
 const doc = await this.messageModel

    .findOne({ chatId })
    .sort({ timestamp: -1 });

  if (!doc) return null;

  return new ChatMessage(
    doc.id.toString(),
    doc.userId,
    doc.chatId,
    doc.content,
    doc.receiverId,
    doc.senderType,
    doc.isRead,
    doc.timestamp,
    doc.type as MessageType,
    doc.imageUrl,
  );
}
}