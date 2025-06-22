// import { Controller, Post, Body, Get, Param } from '@nestjs/common';
// import { OperatorService } from '../services/operator.service';
// import { CreateOperatorDto } from 'src/domain/operators/dto/create-operator.dto';


// @Controller('operators')
// export class OperatorController {
//   constructor(private readonly service: OperatorService) {}

//   @Post()
//   async create(@Body() dto: CreateOperatorDto) {
//     return this.service.create(dto);
//   }

//   @Get('available')
//   async getAvailable() {
//     return this.service.getAvailable();
//   }

//   @Get(':id')
//   async getById(@Param('id') id: string) {
//     return this.service.getById(id);
//   }
// }




//------------------------- ESTO FUNCIONA-------------------------------

// import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
// import { OperatorService } from '../services/operator.service';
// import { CreateOperatorDto } from 'src/domain/operators/dto/create-operator.dto';

// @Controller('operators')
// export class OperatorController {
//   constructor(private readonly service: OperatorService) {}

//   @Post()
//   async create(@Body() dto: CreateOperatorDto) {
//     console.log('[OperatorController] create called with dto:', dto);
//     try {
//       const result = await this.service.create(dto);
//       console.log('[OperatorController] create result:', result);
//       return result;
//     } catch (error) {
//       console.error('[OperatorController] create error:', error);
//       throw new HttpException('Error creating operator', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   @Get('available')
//   async getAvailable() {
//     console.log('[OperatorController] getAvailable called');
//     try {
//       const result = await this.service.getAvailable();
//       console.log('[OperatorController] getAvailable result:', result);
//       return result;
//     } catch (error) {
//       console.error('[OperatorController] getAvailable error:', error);
//       throw new HttpException('Error fetching available operators', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   @Get(':id')
//   async getById(@Param('id') id: string) {
//     console.log('[OperatorController] getById called with id:', id);
//     try {
//       const result = await this.service.getById(id);
//       console.log('[OperatorController] getById result:', result);
//       if (!result) {
//         console.warn('[OperatorController] getById no operator found with id:', id);
//         throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
//       }
//       return result;
//     } catch (error) {
//       console.error('[OperatorController] getById error:', error);
//       if (error instanceof HttpException) throw error;
//       throw new HttpException('Error fetching operator by id', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }
// }
//---------------------------------------------------------------------------------------------------





import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { OperatorService } from '../services/operator.service';
import { CreateOperatorDto } from 'src/domain/operators/dto/create-operator.dto';
import { OperatorState } from 'src/domain/operators/entities/operator.entity';

@ApiTags('Operators') // Agrupa en Swagger
@Controller('operators')
export class OperatorController {
  constructor(private readonly service: OperatorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo operador' })
  @ApiBody({ type: CreateOperatorDto })
  @ApiResponse({ status: 201, description: 'Operador creado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() dto: CreateOperatorDto) {
    return await this.service.create(dto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Obtener operadores disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de operadores disponibles' })
  async getAvailable() {
    return await this.service.getAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener operador por ID' })
  @ApiParam({ name: 'id', description: 'ID del operador' })
  @ApiResponse({ status: 200, description: 'Operador encontrado' })
  @ApiResponse({ status: 404, description: 'Operador no encontrado' })
  async getById(@Param('id') id: string) {
    const result = await this.service.getById(id);
    if (!result)
      throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
    return result;
  }

  @Post('assign')
  @ApiOperation({ summary: 'Asignar automáticamente un operador disponible' })
  @ApiResponse({ status: 200, description: 'Operador asignado' })
  @ApiResponse({ status: 404, description: 'No hay operadores disponibles' })
  async assignOperator() {
    return await this.service.assignOperator();
  }

  @Patch(':id/state')
  @ApiOperation({ summary: 'Actualizar estado de un operador' })
  @ApiParam({ name: 'id', description: 'ID del operador' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          enum: Object.values(OperatorState),
          example: 'AVAILABLE',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Operador no encontrado' })
  async updateState(
    @Param('id') id: string,
    @Body() body: { state: OperatorState },
  ) {
    return await this.service.updateState(id, body.state);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Liberar un operador (por ejemplo, al terminar un chat)' })
  @ApiParam({ name: 'id', description: 'ID del operador' })
  @ApiResponse({ status: 200, description: 'Operador liberado' })
  async release(@Param('id') id: string) {
    return await this.service.releaseOperator(id);
  }
}
