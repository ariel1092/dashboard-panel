export class UserAlreadyExistsException extends Error {
    constructor(message: string = 'El usuario ya existe') {
      super(message);
      this.name = 'UserAlreadyExistsException';
    }
  }