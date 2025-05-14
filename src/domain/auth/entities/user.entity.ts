// src/domain/auth/entities/user.entity.ts

export type UserRole = 'admin' | 'vendedor' | 'analista';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public password: string ,
    public role: UserRole = 'vendedor',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  updatePassword(newHashedPassword: string) {
    this.password = newHashedPassword;
    this.updatedAt = new Date();
  }

  changeRole(newRole: UserRole) {
    this.role = newRole;
    this.updatedAt = new Date();
  }
}
