
import { Inject, Injectable } from '@nestjs/common';
import { CreateOperatorDto } from 'src/domain/operators/dto/create-operator.dto';
import { OperatorRepository } from 'src/domain/operators/repositories/operator.repository';
import { Operator, OperatorState } from 'src/domain/operators/entities/operator.entity';
import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
import { OPERATOR_REPOSITORY } from 'src/domain/token/operator.token';
import { RegisterUserUseCase } from 'src/aplication/auth/register-user.usecase';


@Injectable()
export class OperatorService {
  constructor(
    @Inject(OPERATOR_REPOSITORY)
    private readonly operatorRepo: OperatorRepository,
    private readonly assignOperatorUseCase: AssignOperatorToChatUseCase,
     private readonly registerUserUseCase: RegisterUserUseCase, 

  ) {}

 async create(dto: CreateOperatorDto) {
     const operator = new Operator(
       "",
       dto.name,
       dto.isAvailable ?? true,
       0,
       new Date(),
       (dto.role as 'operador') ?? 'operador'
     );
     await this.operatorRepo.save(operator);
     const user = await this.registerUserUseCase.execute(
    dto.email,
    dto.password,
    'OPERADOR'  // rol de usuario para el token y auth
  );

  // 3. Retornar ambos datos (opcional, para que el admin sepa que se creó todo bien)
  return {
    operator,
    user,
  };
   }

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
    operator.state = operator.activeChats === 0 ? OperatorState.AVAILABLE : OperatorState.BUSY;
    return await this.operatorRepo.update(operator);
  }
}
