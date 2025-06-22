// llama-prompt.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LlamaPromptDto {
  @ApiProperty({
    description: 'Texto del mensaje o prompt que se enviará al modelo de IA',
    example: '¿Qué es el ácido hialurónico y para qué se usa en estética?',
  })
  @IsString()
  prompt: string;
}
