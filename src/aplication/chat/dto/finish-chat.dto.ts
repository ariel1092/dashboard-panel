import { IsString, IsOptional } from "class-validator"

export class FinishChatDto {
  @IsString()
  chatId: string

  @IsOptional()
  @IsString()
  reason?: string // Motivo de finalización
}
