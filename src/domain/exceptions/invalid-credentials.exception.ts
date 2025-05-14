export class InvalidCredentialsException extends Error {
    constructor(message: string = 'Credenciales inválidas') {
      super(message);
      this.name = 'InvalidCredentialsException';
    }
  }