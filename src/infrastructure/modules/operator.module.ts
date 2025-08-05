import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OperatorModel, OperatorSchema } from '../schema/operator.schema';
import { OperatorController } from '../controllers/operator.controller';
import { OperatorService } from '../services/operator.service';
import { MongoOperatorRepository } from '../repositories/mongo-operator.repository';
import { OPERATOR_REPOSITORY } from 'src/domain/token/operator.token';
import { AssignOperatorToChatUseCase } from 'src/aplication/operators/use-cases/assign-operator.use-case';
import { RegisterUserUseCase } from 'src/aplication/auth/register-user.usecase';
import { AuthModule } from './auth.module';
import { CreateOperatorUseCase } from 'src/aplication/operators/use-cases/create-operator.use-case';
import { GetActiveChatsByOperatorUseCase } from 'src/aplication/chat/use-cases/get-active-chats-by-operator.use-case';
import { ChatModule } from './chat.module';



@Module({
  imports: [AuthModule,
     forwardRef(() => ChatModule),
    MongooseModule.forFeature([{ name: OperatorModel.name, schema: OperatorSchema }]),
  ],
  controllers: [OperatorController],
  providers: [
    OperatorService,
    AssignOperatorToChatUseCase,
    RegisterUserUseCase,
    CreateOperatorUseCase,
    GetActiveChatsByOperatorUseCase,
    
    {
      provide: OPERATOR_REPOSITORY,
      useClass: MongoOperatorRepository,
    },
 
  ],
  exports: [OperatorService, OPERATOR_REPOSITORY,AssignOperatorToChatUseCase,CreateOperatorUseCase,GetActiveChatsByOperatorUseCase],
})
export class OperatorModule {}