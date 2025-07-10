import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateMessageDto {
  @ApiProperty({
    description: 'ID del usuario que envía el mensaje',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID del chat actual donde se desarrolla la conversación',
    example: 'chat-456',
  })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    description: 'Mensaje que el usuario desea enviar a la inteligencia artificial',
    example: '¿Tienen promociones para depilación láser?',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
