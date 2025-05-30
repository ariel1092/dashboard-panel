import { IsString } from "class-validator"

export class JoinChatDto {
  @IsString()
  chatId: string
}
