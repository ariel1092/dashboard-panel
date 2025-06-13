import { IsEnum, IsOptional } from 'class-validator';
import { ChatType } from 'src/domain/enum/chat.enum';


export class CreateChatDto {
  @IsOptional()
  @IsEnum(ChatType)
  chatType?: ChatType;
}