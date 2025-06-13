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
import { OperatorService } from '../services/operator.service';
import { CreateOperatorDto } from 'src/domain/operators/dto/create-operator.dto';
import { OperatorState } from 'src/domain/operators/entities/operator.entity';

@Controller('operators')
export class OperatorController {
  constructor(private readonly service: OperatorService) {}

  @Post()
  async create(@Body() dto: CreateOperatorDto) {
    return await this.service.create(dto);
  }

  @Get('available')
  async getAvailable() {
    return await this.service.getAvailable();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.service.getById(id);
    if (!result) throw new HttpException('Operator not found', HttpStatus.NOT_FOUND);
    return result;
  }

  // ✅ NUEVO: Asignar automáticamente un operador disponible
  @Post('assign')
  async assignOperator() {
    return await this.service.assignOperator();
  }

  // ✅ NUEVO: Actualizar estado manualmente
  @Patch(':id/state')
  async updateState(@Param('id') id: string, @Body() body: { state: OperatorState }) {
    return await this.service.updateState(id, body.state);
  }

  // ✅ NUEVO: Liberar operador (al terminar un chat)
  @Post(':id/release')
  async release(@Param('id') id: string) {
    return await this.service.releaseOperator(id);
  }
}
