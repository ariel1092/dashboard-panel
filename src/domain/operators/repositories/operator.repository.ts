import { Operator } from "../entities/operator.entity";

export abstract class OperatorRepository {
  abstract findAvailable(): Promise<Operator[]>;
  abstract findById(id: string): Promise<Operator | null>;
  abstract save(operator: Operator): Promise<void>;
  abstract update(operator: Operator): Promise<Operator>;
}