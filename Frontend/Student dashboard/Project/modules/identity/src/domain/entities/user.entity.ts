import { UserRole } from '../enums/user-role.enum';

export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  isActive: boolean;
  googleId?: string;
  tokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    roles: UserRole[],
    isEmailVerified: boolean = false,
    isActive: boolean = true,
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.roles = roles;
    this.isEmailVerified = isEmailVerified;
    this.isActive = isActive;
    this.tokenVersion = 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  incrementTokenVersion(): void {
    this.tokenVersion += 1;
    this.updatedAt = new Date();
  }
}
