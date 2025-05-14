export class Client {
    constructor(
      public readonly id: string,
      public phone: string,
      public name: string,
      public interactions: number = 0,
      public lastContact: Date | null = null,
      public active: boolean = true,
      public lastInteraction: Date | null = null,
    ) {}
  }
  