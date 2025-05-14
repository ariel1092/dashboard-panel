import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateClientUseCase } from 'src/aplication/clients/use-cases/create-client.usecase';
import { UpdateClientUseCase } from 'src/aplication/clients/use-cases/update-client.use-case';
import { DisableClientUseCase } from 'src/aplication/clients/use-cases/disableClient-client.use-case';
import { FindClientByIdUseCase } from 'src/aplication/clients/use-cases/find-client-by-id.use-case';
import { FindClientByPhoneUseCase } from 'src/aplication/clients/use-cases/find-client-by-phone.use-case';
import { FindClientByEmailUseCase } from 'src/aplication/clients/use-cases/find-client-by-email.use-case';
import { GetAllClientsUseCase } from 'src/aplication/clients/use-cases/get-all-clients.use-case';
import { ClientExistsUseCase } from 'src/aplication/clients/use-cases/client-exists.use-case';
import { CountClientsUseCase } from 'src/aplication/clients/use-cases/count-clients.use-case';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateClientDto } from 'src/aplication/clients/DTO/create-client.dto';

@Controller('clients')
@ApiTags('Clients')
export class ClientController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly updateClient: UpdateClientUseCase,
    private readonly disableClient: DisableClientUseCase,
    private readonly findById: FindClientByIdUseCase,
    private readonly findByPhone: FindClientByPhoneUseCase,
    private readonly findByEmail: FindClientByEmailUseCase,
    private readonly getAll: GetAllClientsUseCase,
    private readonly clientExists: ClientExistsUseCase,
    private readonly countClients: CountClientsUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  async create(@Body() data: CreateClientDto) {
    return this.createClient.execute(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.updateClient.execute(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (disable) a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  async remove(@Param('id') id: string) {
    return this.disableClient.execute(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  async findAll() {
    try {
      const clients = await this.getAll.execute();
      console.log('📝 GetAllClientsUseCase returned:', clients);
      return clients;
    } catch (error) {
      console.error('❌ Error en GET /clients:', error);
      throw error;  // para que Nest lo imprima también con stack
    }
  }

  @Get('count')
  @ApiOperation({ summary: 'Get the total number of clients' })
  async count() {
    return this.countClients.execute();
  }

  @Get('exists')
  @ApiOperation({ summary: 'Check if a client exists by phone' })
  @ApiQuery({ name: 'phone', description: 'Phone number' })
  async exists(@Query('phone') phone: string) {
    return this.clientExists.execute(phone);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Find a client by phone number' })
  @ApiParam({ name: 'phone', description: 'Phone number' })
  async findByPhoneNumber(@Param('phone') phone: string) {
    return this.findByPhone.execute(phone);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Find a client by email address' })
  @ApiParam({ name: 'email', description: 'Email address' })
  async findByEmailAddress(@Param('email') email: string) {
    return this.findByEmail.execute(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  async findOne(@Param('id') id: string) {
    return this.findById.execute(id);
  }
}
