import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../application/ports/user.repository.port';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly users: Map<string, User> = new Map();
  private readonly emailIndex: Map<string, string> = new Map();
  private readonly googleIdIndex: Map<string, string> = new Map();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    if (user.googleId) {
      this.googleIdIndex.set(user.googleId, user.id);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) || null : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const userId = this.googleIdIndex.get(googleId);
    return userId ? this.users.get(userId) || null : null;
  }

  async update(user: User): Promise<User> {
    user.updatedAt = new Date();
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.emailIndex.delete(user.email.toLowerCase());
      if (user.googleId) {
        this.googleIdIndex.delete(user.googleId);
      }
      this.users.delete(id);
    }
  }

  async findByRoles(roles: UserRole[]): Promise<User[]> {
    const results: User[] = [];
    for (const user of this.users.values()) {
      if (roles.some((role) => user.roles.includes(role))) {
        results.push(user);
      }
    }
    return results;
  }

  async exists(email: string): Promise<boolean> {
    return this.emailIndex.has(email.toLowerCase());
  }
}
