import { Types } from 'mongoose';



export enum OperatorState {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  SATURATED = 'SATURATED',
  OFFLINE = 'OFFLINE',
}




export class Operator {
  public readonly id: string;
  public name: string;
  public isAvailable: boolean;
  public activeChats: number;
  public lastMessageTime: Date;
  public state: OperatorState = OperatorState.AVAILABLE;
  public role: 'operador' = 'operador'; // 👈 CAMPO NUEVO

  constructor(
    id: string | null | undefined,
    name: string,
    isAvailable: boolean,
    activeChats: number,
    lastMessageTime: Date,
    role: 'operador' = 'operador' // 👈 NUEVO PARÁMETRO
  ) {
    this.id = id && id !== '' ? id : new Types.ObjectId().toHexString();
    this.name = name;
    this.isAvailable = isAvailable;
    this.activeChats = activeChats;
    this.lastMessageTime = lastMessageTime;
    this.role = role;
  }
}
