import { IsInt, IsOptional, IsString } from "class-validator";


export class LlamaDto {
@IsString()
readonly prompt: string;
@IsInt()
@IsOptional()
readonly maxTokens?: number;
}