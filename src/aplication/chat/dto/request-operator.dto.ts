import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class RequestOperatorDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsOptional()
  @IsNumber()
  priority?: number; // Para futuras mejoras (usuarios VIP, etc.)
}
