// src/common/pipes/parse-object-id.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string): Types.ObjectId {
    const isValid = Types.ObjectId.isValid(value);
    if (!isValid) {
      throw new BadRequestException(`El valor '${value}' no es un ObjectId válido`);
    }
    return new Types.ObjectId(value);
  }
}
