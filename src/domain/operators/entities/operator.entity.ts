import { Types } from 'mongoose';



export enum OperatorState {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  SATURATED = 'SATURATED',
  OFFLINE = 'OFFLINE',
}




export class Operator {
  public readonly id: string;
  public readonly name: string;
  public email: string;
  public isAvailable: boolean;
  public activeChats: number;
  public lastMessageTime: Date;
  public state: OperatorState = OperatorState.AVAILABLE;
  public role: 'operador' = 'operador';

  constructor(
    id: string | null | undefined,
    name: string,
    email:string,
    isAvailable: boolean,
    activeChats: number,
    lastMessageTime: Date,
    role: 'operador' = 'operador'
  ) {
    this.id = id && id !== '' ? id : new Types.ObjectId().toHexString();
    this.name = name;
    this.email = email;
    this.isAvailable = isAvailable;
    this.activeChats = activeChats;
    this.lastMessageTime = lastMessageTime;
    this.role = role;
  }
   static create(dto: {
    name: string;
    email:string;
    isAvailable?: boolean;
    activeChats?: number;
    lastMessageTime?: Date;
  }): Operator {
    return new Operator(
      null,
      dto.name,
      dto.email,
      dto.isAvailable ?? true,
      dto.activeChats ?? 0,
      dto.lastMessageTime ?? new Date(),
      'operador' // 👈 tipo literal
    );
  }
}
