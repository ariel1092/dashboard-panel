import { Operator } from "src/domain/operators/entities/operator.entity";
import { MongoOperatorRepository } from "src/infrastructure/repositories/mongo-operator.repository";


export class AssignOperatorToChatUseCase {
  constructor(private readonly operatorRepo: MongoOperatorRepository) {}

  async execute(): Promise<Operator> {
    const available = await this.operatorRepo.findAvailable();

    if (!available.length) throw new Error('No available operators');

    const sorted = available.sort((a, b) => {
      if (a.activeChats !== b.activeChats) return a.activeChats - b.activeChats;
      return a.lastMessageTime.getTime() - b.lastMessageTime.getTime();
    });

    const selected = sorted[0];
    selected.activeChats += 1;
    await this.operatorRepo.update(selected);
    return selected;
  }
}