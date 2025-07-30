import { Inject, Injectable } from "@nestjs/common"
import { CreateOperatorDto } from "src/domain/operators/dto/create-operator.dto"
import { Operator } from "src/domain/operators/entities/operator.entity"
import { OPERATOR_REPOSITORY } from "src/domain/token/operator.token"
import { OperatorRepository } from "src/domain/operators/repositories/operator.repository"
import { TokenService } from "src/infrastructure/services/token.service"  // Ajusta la ruta
import { TOKEN_SERVICE } from "src/domain/token/token-service.token"       // Token service token

@Injectable()
export class CreateOperatorUseCase {
  constructor(
    @Inject(OPERATOR_REPOSITORY)
    private readonly operatorRepo: OperatorRepository,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: CreateOperatorDto): Promise<{ user: Operator; token: string; id: string }> {
    // Crear la entidad operator
    const operator = Operator.create(dto)

    // Guardar en la base de datos
    const savedOperator = await this.operatorRepo.save(operator)

    if (!savedOperator.id) {
      throw new Error("El operador guardado no tiene un ID")
    }

    // Generar token JWT para el operador
    const token = this.tokenService.generateToken({
      id: savedOperator.id,
      role: savedOperator.role, // asegúrate que exista la propiedad 'role' en Operator
    })

    return {
      user: savedOperator,
      token,
      id: savedOperator.id,
    }
  }
}
