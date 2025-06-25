// import { Injectable } from "@nestjs/common";
// import { InjectModel } from "@nestjs/mongoose";
// import type { Model } from "mongoose";
// import type { ChatRepository } from "src/domain/chat/chat.repository.interface";
// import { ChatMessage, Chat, ChatStatus } from "src/domain/chat/chat.entity";
// import { ChatMessageModel, type ChatMessageDocument } from "../schema/chat-message.schema";
// import { ChatModel, type ChatDocument } from "../schema/chat.schema";
// import { ConnectedUserModel, type ConnectedUserDocument } from "../schema/connected-user.schema";
// import { v4 as uuidv4 } from "uuid";

// export enum ChatType {
//   IA = "IA",
//   HUMAN = "HUMAN",
// }

// export interface CreateChatParams {
//   userId: string;
//   type: ChatType;
//   status: ChatStatus;
//   createdAt: Date;
//   updatedAt: Date;
// }

// @Injectable()
// export class MongoChatRepository implements ChatRepository {
//   constructor(
//     @InjectModel(ChatMessageModel.name)
//     private readonly chatMessageModel: Model<ChatMessageDocument>,
//     @InjectModel(ChatModel.name)
//     private readonly chatModel: Model<ChatDocument>,
//     @InjectModel(ConnectedUserModel.name)
//     private readonly connectedUserModel: Model<ConnectedUserDocument>,
//   ) {}

//   // ---------- CHATS ----------

//   async createChat(params: CreateChatParams): Promise<Chat> {
//     const chatData = {
//       _id: uuidv4(),
//       userId: params.userId,
//       type: params.type,
//       status: params.status,
//       specialistId: null,
//       createdAt: params.createdAt,
//       updatedAt: params.updatedAt,
//     };

//     const created = new this.chatModel(chatData);
//     const saved = await created.save();

//     return new Chat(
//       saved._id.toString(),
//       saved.status,
//       saved.specialistId,
//       saved.type as ChatType,
//       saved.userId,
//       saved.createdAt,
//       saved.updatedAt,
//     );
//   }

//   async getChatById(chatId: string): Promise<Chat | null> {
//     const doc = await this.chatModel.findById(chatId).lean();
//     if (!doc) return null;

//     return new Chat(
//       doc._id.toString(),
//       doc.status,
//       doc.specialistId,
//       doc.type as ChatType,
//       doc.userId,
//       doc.createdAt,
//       doc.updatedAt,
//     );
//   }

//   async getChatsByUserId(userId: string): Promise<Chat[]> {
//     const chatIds = await this.chatMessageModel.distinct("chatId", { userId }).lean();
//     const docs = await this.chatModel.find({ _id: { $in: chatIds } }).lean();

//     return docs.map((doc) =>
//       new Chat(
//         doc._id.toString(),
//         doc.status,
//         doc.specialistId,
//         doc.type as ChatType,
//         doc.userId,
//         doc.createdAt,
//         doc.updatedAt,
//       ),
//     );
//   }

//   async getChatsBySpecialistId(specialistId: string): Promise<Chat[]> {
//     const docs = await this.chatModel.find({ specialistId }).lean();
//     return docs.map((doc) =>
//       new Chat(
//         doc._id.toString(),
//         doc.status,
//         doc.specialistId,
//         doc.type as ChatType,
//         doc.userId,
//         doc.createdAt,
//         doc.updatedAt,
//       ),
//     );
//   }

//   async updateChat(chat: Chat): Promise<Chat> {
//     const updated = await this.chatModel
//       .findByIdAndUpdate(
//         chat.id,
//         {
//           status: chat.status,
//           specialistId: chat.specialistId,
//           updatedAt: chat.updatedAt,
//         },
//         { new: true },
//       )
//       .lean();

//     if (!updated) {
//       throw new Error("Chat not found");
//     }

//     return new Chat(
//       updated._id.toString(),
//       updated.status,
//       updated.specialistId,
//       updated.type as ChatType,
//       updated.userId,
//       updated.createdAt,
//       updated.updatedAt,
//     );
//   }

//   // ---------- MENSAJES ----------

//   async saveMessage(message: ChatMessage): Promise<ChatMessage> {
//     const created = new this.chatMessageModel(message);
//     const saved = await created.save();

//     return new ChatMessage(
//       saved.id.toString(),
//       saved.userId,
//       saved.chatId,
//       saved.content,
//       saved.receiverId,
//       saved.senderType,
//       saved.isRead,
//       saved.timestamp,
//     );
//   }

//   async getMessages(): Promise<ChatMessage[]> {
//     const docs = await this.chatMessageModel.find().sort({ timestamp: 1 }).lean();
//     return docs.map((doc) =>
//       new ChatMessage(
//         doc._id.toString(),
//         doc.userId,
//         doc.chatId,
//         doc.content,
//         doc.receiverId,
//         doc.senderType,
//         doc.isRead,
//         doc.timestamp,
//       ),
//     );
//   }

//   async getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
//     const docs = await this.chatMessageModel.find({ chatId }).sort({ timestamp: 1 }).lean();
//     return docs.map((doc) =>
//       new ChatMessage(
//         doc._id.toString(),
//         doc.userId,
//         doc.chatId,
//         doc.content,
//         doc.receiverId,
//         doc.senderType,
//         doc.isRead,
//         doc.timestamp,
//       ),
//     );
//   }

//   async markMessageAsRead(messageId: string): Promise<void> {
//     await this.chatMessageModel.findByIdAndUpdate(messageId, { isRead: true });
//   }

//   // ---------- USUARIOS CONECTADOS ----------

//   async addConnectedUser(userId: string, socketId: string): Promise<void> {
//     await this.connectedUserModel.findOneAndUpdate(
//       { userId },
//       { userId, socketId, connectedAt: new Date() },
//       { upsert: true },
//     );
//   }

//   async removeConnectedUser(userId: string): Promise<void> {
//     await this.connectedUserModel.deleteOne({ userId });
//   }

//   async getConnectedUsers(): Promise<{ userId: string; socketId: string }[]> {
//     const docs = await this.connectedUserModel.find().lean();
//     return docs.map((doc) => ({
//       userId: doc.userId,
//       socketId: doc.socketId,
//     }));
//   }

//   async isUserConnected(userId: string): Promise<boolean> {
//     const doc = await this.connectedUserModel.findOne({ userId }).lean();
//     return !!doc;
//   }
// }



//--------------------PRUEBA--------------------------



import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import type { Model } from "mongoose"
import type { ChatRepository } from "src/domain/chat/chat.repository.interface"
import { ChatMessage, Chat, type ChatStatus } from "src/domain/chat/chat.entity"
import { ChatMessageModel, type ChatMessageDocument } from "../schema/chat-message.schema"
import { ChatModel, type ChatDocument } from "../schema/chat.schema"
import { ConnectedUserModel, type ConnectedUserDocument } from "../schema/connected-user.schema"
import { v4 as uuidv4 } from "uuid"

export enum ChatType {
  IA = "IA",
  HUMAN = "HUMAN",
}

export interface CreateChatParams {
  userId: string
  type: ChatType
  status: ChatStatus
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class MongoChatRepository implements ChatRepository {
  constructor(
    @InjectModel(ChatMessageModel.name) private readonly chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(ChatModel.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(ConnectedUserModel.name) private readonly connectedUserModel: Model<ConnectedUserDocument>,
  ) {}

  // ---------- CHATS ----------

  async createChat(params: CreateChatParams): Promise<Chat> {
    const chatData = {
      _id: uuidv4(),
      userId: params.userId,
      type: params.type,
      status: params.status,
      specialistId: null,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    }

    const created = new this.chatModel(chatData)
    const saved = await created.save()

    return new Chat(
      saved._id.toString(),
      saved.status,
      saved.specialistId,
      saved.type as ChatType,
      saved.userId,
      saved.createdAt,
      saved.updatedAt,
    )
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    const doc = await this.chatModel.findById(chatId).lean()
    if (!doc) return null

    return new Chat(
      doc._id.toString(),
      doc.status,
      doc.specialistId,
      doc.type as ChatType,
      doc.userId,
      doc.createdAt,
      doc.updatedAt,
    )
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    const chatIds = await this.chatMessageModel.distinct("chatId", { userId }).lean()
    const docs = await this.chatModel.find({ _id: { $in: chatIds } }).lean()

    return docs.map(
      (doc) =>
        new Chat(
          doc._id.toString(),
          doc.status,
          doc.specialistId,
          doc.type as ChatType,
          doc.userId,
          doc.createdAt,
          doc.updatedAt,
        ),
    )
  }

  async getChatsBySpecialistId(specialistId: string): Promise<Chat[]> {
    const docs = await this.chatModel.find({ specialistId }).lean()
    return docs.map(
      (doc) =>
        new Chat(
          doc._id.toString(),
          doc.status,
          doc.specialistId,
          doc.type as ChatType,
          doc.userId,
          doc.createdAt,
          doc.updatedAt,
        ),
    )
  }

  async updateChat(chat: Chat): Promise<Chat> {
    const updated = await this.chatModel
      .findByIdAndUpdate(
        chat.id,
        {
          status: chat.status,
          specialistId: chat.specialistId,
          type: chat.type, // ✅ Actualizar tipo también
          updatedAt: chat.updatedAt,
        },
        { new: true },
      )
      .lean()

    if (!updated) {
      throw new Error("Chat not found")
    }

    return new Chat(
      updated._id.toString(),
      updated.status,
      updated.specialistId,
      updated.type as ChatType,
      updated.userId,
      updated.createdAt,
      updated.updatedAt,
    )
  }

  // ---------- MENSAJES ----------

  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    const created = new this.chatMessageModel(message)
    const saved = await created.save()

    return new ChatMessage(
      saved.id.toString(),
      saved.userId,
      saved.chatId,
      saved.content,
      saved.receiverId,
      saved.senderType,
      saved.isRead,
      saved.timestamp,
    )
  }

  async getMessages(): Promise<ChatMessage[]> {
    const docs = await this.chatMessageModel.find().sort({ timestamp: 1 }).lean()
    return docs.map(
      (doc) =>
        new ChatMessage(
          doc._id.toString(),
          doc.userId,
          doc.chatId,
          doc.content,
          doc.receiverId,
          doc.senderType,
          doc.isRead,
          doc.timestamp,
        ),
    )
  }

  async getMessagesByChatId(chatId: string): Promise<ChatMessage[]> {
    const docs = await this.chatMessageModel.find({ chatId }).sort({ timestamp: 1 }).lean()
    return docs.map(
      (doc) =>
        new ChatMessage(
          doc._id.toString(),
          doc.userId,
          doc.chatId,
          doc.content,
          doc.receiverId,
          doc.senderType,
          doc.isRead,
          doc.timestamp,
        ),
    )
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.chatMessageModel.findByIdAndUpdate(messageId, { isRead: true })
  }

  // ---------- USUARIOS CONECTADOS ----------

  async addConnectedUser(userId: string, socketId: string): Promise<void> {
    await this.connectedUserModel.findOneAndUpdate(
      { userId },
      { userId, socketId, connectedAt: new Date() },
      { upsert: true },
    )
  }

  async removeConnectedUser(userId: string): Promise<void> {
    await this.connectedUserModel.deleteOne({ userId })
  }

  async getConnectedUsers(): Promise<{ userId: string; socketId: string }[]> {
    const docs = await this.connectedUserModel.find().lean()
    return docs.map((doc) => ({
      userId: doc.userId,
      socketId: doc.socketId,
    }))
  }

  async isUserConnected(userId: string): Promise<boolean> {
    const doc = await this.connectedUserModel.findOne({ userId }).lean()
    return !!doc
  }
}

