// import { Operator } from "src/domain/operators/entities/operator.entity";
// import { OPERATOR_REPOSITORY } from "src/domain/token/operator.token";
// import { MongoOperatorRepository } from "src/infrastructure/repositories/mongo-operator.repository";
// import {  Inject } from "@nestjs/common";


// export class AssignOperatorToChatUseCase {
//   constructor(
//      @Inject(OPERATOR_REPOSITORY)
//     private readonly operatorRepo: MongoOperatorRepository) {}

//   async execute(): Promise<Operator> {
//     try {
//       const available = await this.operatorRepo.findAvailable();

//       console.log('🕵️‍♂️ Operadores disponibles encontrados:', available.length);
//       if (!available.length) {
//         console.log('❌ No hay operadores disponibles en AssignOperatorToChatUseCase');
//         throw new Error('No available operators');
//       }

//       const sorted = available.sort((a, b) => {
//         if (a.activeChats !== b.activeChats) return a.activeChats - b.activeChats;
//         return a.lastMessageTime.getTime() - b.lastMessageTime.getTime();
//       });

//       const selected = sorted[0];
//       console.log('✅ Operador seleccionado para asignar:', selected.name, selected.id);

//       selected.activeChats += 1;
//       await this.operatorRepo.update(selected);
//       console.log('🆙 Operador actualizado con activeChats:', selected.activeChats);

//       return selected;
//     } catch (error) {
//       console.error('🔥 Error en AssignOperatorToChatUseCase:', error);
//       throw error;
//     }
//   }
// }






import type { Operator } from "src/domain/operators/entities/operator.entity"
import { OPERATOR_REPOSITORY } from "src/domain/token/operator.token"
import type { MongoOperatorRepository } from "src/infrastructure/repositories/mongo-operator.repository"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class AssignOperatorToChatUseCase {
  constructor(
    @Inject(OPERATOR_REPOSITORY)
    private readonly operatorRepo: MongoOperatorRepository) {}

  async execute(): Promise<Operator> {
    try {
      const available = await this.operatorRepo.findAvailable()

      console.log("🕵️‍♂️ Operadores disponibles encontrados:", available.length)
      if (!available.length) {
        console.log("❌ No hay operadores disponibles en AssignOperatorToChatUseCase")
        throw new Error("No available operators")
      }

      const sorted = available.sort((a, b) => {
        if (a.activeChats !== b.activeChats) return a.activeChats - b.activeChats
        return a.lastMessageTime.getTime() - b.lastMessageTime.getTime()
      })

      const selected = sorted[0]
      console.log("✅ Operador seleccionado para asignar:", selected.name, selected.id)

      selected.activeChats += 1
      await this.operatorRepo.update(selected)
      console.log("🆙 Operador actualizado con activeChats:", selected.activeChats)

      return selected
    } catch (error) {
      console.error("🔥 Error en AssignOperatorToChatUseCase:", error)
      throw error
    }
  }
}
