import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOperatorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;
}
