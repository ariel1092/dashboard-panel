// src/infrastructure/controllers/admin.controller.ts

import { Controller, Post, Logger } from '@nestjs/common';
import { NormalizePhoneNumbersUseCase } from 'src/aplication/clients/use-cases/normalize-phone-numbers.usecase';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('admin')
@ApiTags('Admin')
// @UseGuards(JwtAuthGuard) // Asegúrate de proteger este endpoint
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly normalizePhoneNumbers: NormalizePhoneNumbersUseCase,
  ) {}

  @Post('normalize-phone-numbers')
  @ApiOperation({ summary: 'Normaliza todos los números de teléfono en la base de datos' })
  @ApiResponse({ status: 200, description: 'Números normalizados correctamente' })
  async normalizePhoneNumber() {
    this.logger.log('Recibida solicitud para normalizar números de teléfono');
    return this.normalizePhoneNumbers.execute();
  }
}