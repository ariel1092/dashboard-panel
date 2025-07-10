import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatPromptDto {


  userId: string;
  @ApiProperty({
    description: 'ID del chat al que pertenece el mensaje',
    example: 'chat-456',
  })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    description: 'Mensaje del usuario para enviar a la IA',
    example: '¿Qué promociones tienen para depilación láser?',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
