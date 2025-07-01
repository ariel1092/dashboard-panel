import { IsString, IsNumber, IsOptional, Min, Max, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

class CategoryRatings {
  @IsNumber()
  @Min(1)
  @Max(5)
  friendliness: number

  @IsNumber()
  @Min(1)
  @Max(5)
  helpfulness: number

  @IsNumber()
  @Min(1)
  @Max(5)
  responseTime: number

  @IsNumber()
  @Min(1)
  @Max(5)
  problemResolution: number
}

export class RateChatDto {
  @IsString()
  chatId: string

  @IsString()
  clientId: string

  @IsString()
  operatorId: string

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number

  @IsOptional()
  @IsString()
  comment?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryRatings)
  categories?: CategoryRatings
}
