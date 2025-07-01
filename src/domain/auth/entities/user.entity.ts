// // src/domain/auth/entities/user.entity.ts

export type UserRole = 'ADMIN' | 'CLIENT' | 'OPERADOR';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public password: string ,
    public role: UserRole = 'CLIENT',
  ) {}

}
