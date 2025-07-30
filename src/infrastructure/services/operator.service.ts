
import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOperatorDto } from 'src/domain/operators/dto/create-operator.dto';
import { OperatorRepository } from 'src/domain/operators/repositories/operator.repository';
import { Operator, OperatorState } from 'src/domain/operators/entities/operator.entity';
import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
import { OPERATOR_REPOSITORY } from 'src/domain/token/operator.token';
import { CreateOperatorUseCase } from 'src/aplication/operators/use-cases/create-operator.use-case';
import { OperatorController } from '../controllers/operator.controller';


@Injectable()
export class OperatorService {
      private readonly logger = new Logger(OperatorController.name)
  constructor(
    @Inject(OPERATOR_REPOSITORY)
    private readonly operatorRepo: OperatorRepository,
    private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
    private readonly createOperatorUseCase: CreateOperatorUseCase,
   
  ) {}


  async create(dto: CreateOperatorDto): Promise<{ user: Operator; token: string; id: string }> {
    this.logger.log(`[OperatorService] Se llamó a create con nombre: ${dto.name}`);

    const existingOperator = await this.operatorRepo.findByName(dto.name);
    if (existingOperator) {
      throw new ConflictException('El operador ya existe');
    }

    // Ahora el use case devuelve user y token
    const result = await this.createOperatorUseCase.execute(dto);

    // result = { user: Operator, token: string, id: string }
    return result;
  }


  // 1. Registrar el usuario

  async getAvailable(): Promise<Operator[]> {
    return await this.operatorRepo.findAvailable();
  }

  async getById(id: string): Promise<Operator | null> {
    return await this.operatorRepo.findById(id);
  }

  // ✅ Asignar automáticamente un operador disponible
  async assignOperator(): Promise<Operator> {
    return await this.assignOperatorUseCase.execute();
  }

  // ✅ Actualizar estado manualmente (por ID)
  async updateState(id: string, state: OperatorState): Promise<Operator> {
    const operator = await this.getById(id);
    if (!operator) throw new Error('Operator not found');

    operator.state = state;
    return await this.operatorRepo.update(operator);
  }

  // ✅ Liberar operador: se decrementa su contador de chats y cambia a AVAILABLE si corresponde
  async releaseOperator(id: string): Promise<Operator> {
    const operator = await this.getById(id);
    if (!operator) throw new Error('Operator not found');

    operator.activeChats = Math.max(0, operator.activeChats - 1);
    operator.state =
      operator.activeChats === 0 ? OperatorState.AVAILABLE : OperatorState.BUSY;
    return await this.operatorRepo.update(operator);
  }

  async getByName(name: string): Promise<Operator | null> {
    const operatorName = await this.operatorRepo.findByName(name);
    if (!operatorName) {
      throw new NotFoundException(`Operator with name ${name} not found`);
    }
    return operatorName;
}
  }

