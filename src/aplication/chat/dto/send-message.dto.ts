import { IsString, IsOptional } from "class-validator"

export class SendMessageDto {
  @IsString()
  userId: string

  @IsString()
  chatId: string

  @IsString()
  content: string

  @IsOptional()
  @IsString()
  receiverId?: string
}
