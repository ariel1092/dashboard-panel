import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as path from 'path';
import { CloudinaryService } from '../services/cloudinary.service';

import { ApiProperty } from '@nestjs/swagger';

// DTO solo para documentación del archivo
class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Archivo de imagen a subir' })
  file: any;
}

@ApiTags('Upload') // Agrupa en Swagger bajo el tag 'Upload'
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ApiOperation({ summary: 'Subir archivo', description: 'Sube un archivo al servidor local y lo reenvía a Cloudinary.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo a subir',
    type: UploadFileDto,
  })
  @ApiResponse({ status: 201, description: 'Archivo subido correctamente. Devuelve la URL de Cloudinary.' })
  @ApiResponse({ status: 500, description: 'Error interno al subir el archivo.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('📥 Archivo recibido:', file);

    try {
      const imageUrl = await this.cloudinaryService.uploadFile(file.path);
      return { imageUrl };
    } catch (error) {
      console.error('❌ Error subiendo a Cloudinary:', error);
      throw new HttpException(
        'Error al subir archivo a Cloudinary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
