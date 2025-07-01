import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Logger,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CreateClientUseCase } from 'src/aplication/clients/use-cases/create-client.usecase';
import { UpdateClientUseCase } from 'src/aplication/clients/use-cases/update-client.use-case';
import { DisableClientUseCase } from 'src/aplication/clients/use-cases/disableClient-client.use-case';
import { FindClientByIdUseCase } from 'src/aplication/clients/use-cases/find-client-by-id.use-case';
import { FindClientByPhoneUseCase } from 'src/aplication/clients/use-cases/find-client-by-phone.use-case';
import { FindClientByEmailUseCase } from 'src/aplication/clients/use-cases/find-client-by-email.use-case';
import { GetAllClientsUseCase } from 'src/aplication/clients/use-cases/get-all-clients.use-case';
import { ClientExistsUseCase } from 'src/aplication/clients/use-cases/client-exists.use-case';
import { CountClientsUseCase } from 'src/aplication/clients/use-cases/count-clients.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CreateClientDto } from 'src/aplication/clients/DTO/create-client.dto';
import { UpdateClientDto } from 'src/aplication/clients/DTO/update-client.dto';
import { Client } from 'src/domain/clients/entities/client.entity';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
@ApiTags('Clients')
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly updateClient: UpdateClientUseCase,
    private readonly disableClient: DisableClientUseCase,
    private readonly findById: FindClientByIdUseCase,
    private readonly findByPhone: FindClientByPhoneUseCase,
    private readonly findByEmail: FindClientByEmailUseCase,
    private readonly getAllClients: GetAllClientsUseCase,
    private readonly clientExists: ClientExistsUseCase,
    private readonly countClients: CountClientsUseCase,
  ) {}

  @Get('exists')
  @ApiOperation({ summary: 'Check if a client exists by phone (query param)' })
  @ApiQuery({ name: 'phone', required: true })
  async exists(@Query('phone') phone: string) {
    if (!phone) {
      throw new BadRequestException('El parámetro phone es obligatorio');
    }
    const exists = await this.clientExists.execute(phone);
    return { exists };
  }

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  async create(@Body() data: CreateClientDto) {
    return this.createClient.execute(data);
  }

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get all clients' })
  async findAll() {
    const clients = await this.getAllClients.execute();
    return clients;
  }

  @Get('count')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get the total number of clients' })
  async count() {
    return this.countClients.execute();
  }

  @Get('phone/:phone')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Find a client by phone number' })
  @ApiParam({ name: 'phone' })
  async findByPhoneNumber(@Param('phone') phone: string) {
    const result = await this.findByPhone.execute(phone);
    if (!result) throw new NotFoundException(`Cliente con teléfono ${phone} no encontrado`);
    return result;
  }

  @Get('email/:email')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Find a client by email address' })
  @ApiParam({ name: 'email' })
  async findByEmailAddress(@Param('email') email: string) {
    const result = await this.findByEmail.execute(email);
    return result;
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    const result = await this.findById.execute(id);
    return result;
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a client by ID' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() data: UpdateClientDto) {
    return this.updateClient.execute(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a client by ID' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    return this.disableClient.execute(id);
  }

  // ==================== ENDPOINTS DE PRUEBA ====================

 @Get('debug/test-normalization')
  @Roles('admin')
  @ApiOperation({ summary: 'Probar normalización de teléfonos (TEMPORAL)' })
  async testNormalization() {
    this.logger.log('🧪 Iniciando prueba de normalización');
    
    try {
      // 1. Crear un cliente con teléfono no normalizado
      const testPhone = '99-180-3892'; // Con guiones
      const testClient = {
        name: 'Cliente de Prueba Normalización',
        phone: testPhone,
      };
      
      this.logger.log(`📞 Creando cliente con teléfono: "${testPhone}"`);
      const created = await this.createClient.execute(testClient);
      this.logger.log(`✅ Cliente creado: ${JSON.stringify(created)}`);
      
      // 2. Buscar el cliente por teléfono normalizado
      const normalizedPhone = '991803892';
      this.logger.log(`🔍 Buscando cliente con teléfono normalizado: "${normalizedPhone}"`);
      let found: Client | null = null;
      try {
        found = await this.findByPhone.execute(normalizedPhone);
        this.logger.log(`🎯 Cliente encontrado: ${JSON.stringify(found)}`);
      } catch (error) {
        this.logger.error(`❌ Error al buscar por teléfono normalizado: ${error.message}`);
      }
      
      // 3. Buscar el cliente por teléfono con formato original
      this.logger.log(`🔍 Buscando cliente con teléfono original: "${testPhone}"`);
      let foundOriginal: Client | null = null;
      try {
        foundOriginal = await this.findByPhone.execute(testPhone);
        this.logger.log(`🎯 Cliente encontrado con formato original: ${JSON.stringify(foundOriginal)}`);
      } catch (error) {
        this.logger.error(`❌ Error al buscar por teléfono original: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Prueba de normalización completada',
        results: {
          originalPhone: testPhone,
          normalizedPhone: normalizedPhone,
          createdClient: created,
          foundByNormalized: found,
          foundByOriginal: foundOriginal,
          normalizationWorking: !!(found && foundOriginal && found.id === foundOriginal.id)
        }
      };
      
    } catch (error) {
      this.logger.error(`❌ Error en prueba de normalización: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

 @Get('debug/fix-specific/:phone')
  @Roles('admin')
  @ApiOperation({ summary: 'Diagnosticar y corregir cliente específico' })
  @ApiParam({ name: 'phone', description: 'Phone number to fix' })
  async fixSpecificClient(@Param('phone') phone: string) {
    this.logger.log(`🔧 Diagnosticando cliente con teléfono: "${phone}"`);
    
    try {
      // 1. Obtener todos los clientes para encontrar el problemático
      const allClients = await this.getAllClients.execute();
      const problematicClient = allClients.find(client => {
        const clientPhone = (client.phone || '').replace(/\D/g, '');
        const searchPhone = phone.replace(/\D/g, '');
        return clientPhone === searchPhone;
      });
      
      if (!problematicClient) {
        return {
          success: false,
          message: `No se encontró cliente con teléfono ${phone} en la lista general`
        };
      }
      
      this.logger.log(`📋 Cliente encontrado en lista: ${JSON.stringify(problematicClient)}`);
      
      // 2. Intentar buscarlo por teléfono
      let foundBySearch: Client | null = null;
      try {
        foundBySearch = await this.findByPhone.execute(phone);
      } catch (error) {
        this.logger.log(`❌ Error al buscar por teléfono: ${error.message}`);
      }
      
      // 3. Intentar actualizar el cliente para "refrescar" sus datos
      // Crear un objeto que cumpla con UpdateClientDto
      // Asegurarnos de que todos los campos requeridos estén presentes
      const updateData: UpdateClientDto = {
        phone: phone.replace(/\D/g, ''), // Normalizar manualmente
        name: problematicClient.name,
        // Si lastContact y lastInteraction son opcionales en UpdateClientDto, podemos incluirlos solo si existen
        ...(problematicClient.lastContact && { 
          lastContact: problematicClient.lastContact.toISOString() 
        }),
        ...(problematicClient.lastInteraction && { 
          lastInteraction: problematicClient.lastInteraction.toISOString() 
        })
      };
      
      const updateResult = await this.updateClient.execute(problematicClient.id, updateData);
      
      this.logger.log(`🔄 Cliente actualizado: ${JSON.stringify(updateResult)}`);
      
      // 4. Intentar buscarlo de nuevo
      let foundAfterUpdate: Client | null = null;
      try {
        foundAfterUpdate = await this.findByPhone.execute(phone);
      } catch (error) {
        this.logger.log(`❌ Error al buscar después de actualizar: ${error.message}`);
      }
      
      return {
        success: true,
        originalClient: problematicClient,
        foundBySearchBefore: foundBySearch,
        updateResult,
        foundAfterUpdate,
        fixed: !!foundAfterUpdate
      };
      
    } catch (error) {
      this.logger.error(`❌ Error en corrección específica: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

 @Post('debug/normalize-all')
  @Roles('admin')
  @ApiOperation({ summary: 'Normalizar todos los números de teléfono' })
  async normalizeAllPhones() {
    this.logger.log('🚀 Iniciando normalización masiva de teléfonos');
    
    try {
      // Obtener todos los clientes
      const allClients = await this.getAllClients.execute();
      this.logger.log(`📊 Total de clientes a procesar: ${allClients.length}`);
      
      const results = {
        total: allClients.length,
        processed: 0,
        normalized: 0,
        unchanged: 0,
        errors: 0,
        details: [] as any[]
      };
      
      // Procesar cada cliente
      for (const client of allClients) {
        try {
          results.processed++;
          const originalPhone = client.phone || '';
          const normalizedPhone = originalPhone.replace(/\D/g, '').trim();
          
          if (originalPhone === normalizedPhone) {
            results.unchanged++;
            continue;
          }
          
          // Actualizar el cliente con el teléfono normalizado
          // Crear un objeto que cumpla con UpdateClientDto
          // Asegurarnos de que todos los campos requeridos estén presentes
          const updateData: UpdateClientDto = {
            phone: normalizedPhone,
            name: client.name,
            // Si lastContact y lastInteraction son opcionales en UpdateClientDto, podemos incluirlos solo si existen
            ...(client.lastContact && { 
              lastContact: client.lastContact.toISOString() 
            }),
            ...(client.lastInteraction && { 
              lastInteraction: client.lastInteraction.toISOString() 
            })
          };
          
          await this.updateClient.execute(client.id, updateData);
          
          results.normalized++;
          results.details.push({
            id: client.id,
            name: client.name,
            before: originalPhone,
            after: normalizedPhone
          });
          
          this.logger.log(`✅ Normalizado: ${client.name} | ${originalPhone} → ${normalizedPhone}`);
          
        } catch (error) {
          results.errors++;
          this.logger.error(`❌ Error procesando cliente ${client.id}: ${error.message}`);
          results.details.push({
            id: client.id,
            name: client.name,
            error: error.message
          });
        }
      }
      
      this.logger.log(`🎉 Normalización completada: ${results.normalized} normalizados, ${results.unchanged} sin cambios, ${results.errors} errores`);
      
      return {
        success: true,
        message: 'Normalización masiva completada',
        results
      };
      
    } catch (error) {
      this.logger.error(`❌ Error en normalización masiva: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
}