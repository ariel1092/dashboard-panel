// import { IsString, IsOptional } from "class-validator"

// export class SendMessageDto {
//   @IsString()
//   userId: string

//   @IsString()
//   chatId: string

//   @IsString()
//   content: string

//   @IsOptional()
//   @IsString()
//   receiverId?: string
// }


import { IsString, IsOptional, IsEnum } from "class-validator"

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  // otros tipos si querés
}

export class SendMessageDto {
  @IsString()
  userId: string

  @IsString()
  chatId: string

  @IsEnum(MessageType)
  type: MessageType

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsString()
  receiverId?: string
}
