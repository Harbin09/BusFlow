import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findByRoles(roles: UserRole[]): Promise<User[]>;
  exists(email: string): Promise<boolean>;
}
