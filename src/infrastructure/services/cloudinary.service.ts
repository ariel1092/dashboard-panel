import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(filePath: string): Promise<string> {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder: 'chat-uploads',
    });
    return result.secure_url;
  }

  async uploadBase64(base64: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'chat-uploads',
    });
    return result.secure_url;
  }
}
