import { User } from '../src/domain/entities/user.entity';
import { UserRole } from '../src/domain/enums/user-role.enum';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with required fields', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.roles).toEqual([UserRole.STUDENT]);
    });

    it('should set default values', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.isEmailVerified).toBe(false);
      expect(user.isActive).toBe(true);
      expect(user.tokenVersion).toBe(0);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should allow optional email verification', () => {
      const user = new User(
        'user-1',
        'test@example.com',
        'John',
        'Doe',
        [UserRole.STUDENT],
        true,
      );

      expect(user.isEmailVerified).toBe(true);
    });

    it('should allow optional active status', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT], true, false);

      expect(user.isActive).toBe(false);
    });

    it('should support multiple roles', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [
        UserRole.ADMIN,
        UserRole.DRIVER,
      ]);

      expect(user.roles).toHaveLength(2);
      expect(user.roles).toContain(UserRole.ADMIN);
      expect(user.roles).toContain(UserRole.DRIVER);
    });
  });

  describe('getFullName', () => {
    it('should return concatenated first and last name', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.getFullName()).toBe('John Doe');
    });

    it('should handle single character names', () => {
      const user = new User('user-1', 'test@example.com', 'J', 'D', [UserRole.STUDENT]);

      expect(user.getFullName()).toBe('J D');
    });

    it('should handle names with special characters', () => {
      const user = new User('user-1', 'test@example.com', "O'Brien", "D'Angelo", [
        UserRole.STUDENT,
      ]);

      expect(user.getFullName()).toBe("O'Brien D'Angelo");
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.hasRole(UserRole.STUDENT)).toBe(true);
    });

    it('should return false when user does not have role', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.hasRole(UserRole.ADMIN)).toBe(false);
    });

    it('should check multiple roles correctly', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [
        UserRole.ADMIN,
        UserRole.DRIVER,
      ]);

      expect(user.hasRole(UserRole.ADMIN)).toBe(true);
      expect(user.hasRole(UserRole.DRIVER)).toBe(true);
      expect(user.hasRole(UserRole.STUDENT)).toBe(false);
    });

    it('should handle empty roles array', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', []);

      expect(user.hasRole(UserRole.ADMIN)).toBe(false);
      expect(user.hasRole(UserRole.STUDENT)).toBe(false);
    });
  });

  describe('incrementTokenVersion', () => {
    it('should increment token version by 1', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      const initialVersion = user.tokenVersion;

      user.incrementTokenVersion();

      expect(user.tokenVersion).toBe(initialVersion + 1);
    });

    it('should increment multiple times', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      user.incrementTokenVersion();
      user.incrementTokenVersion();
      user.incrementTokenVersion();

      expect(user.tokenVersion).toBe(3);
    });

    it('should update updatedAt timestamp', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      const initialTime = user.updatedAt;

      user.incrementTokenVersion();

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(initialTime.getTime());
    });
  });

  describe('User fields', () => {
    it('should allow setting passwordHash', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.passwordHash = 'hashed-password';

      expect(user.passwordHash).toBe('hashed-password');
    });

    it('should allow setting googleId', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.googleId = 'google-123';

      expect(user.googleId).toBe('google-123');
    });

    it('should allow setting lastLoginAt', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      const loginTime = new Date();
      user.lastLoginAt = loginTime;

      expect(user.lastLoginAt).toBe(loginTime);
    });

    it('should allow changing email verification status', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.isEmailVerified).toBe(false);

      user.isEmailVerified = true;

      expect(user.isEmailVerified).toBe(true);
    });

    it('should allow changing active status', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      expect(user.isActive).toBe(true);

      user.isActive = false;

      expect(user.isActive).toBe(false);
    });
  });

  describe('User immutability safeguards', () => {
    it('should allow adding roles', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      user.roles.push(UserRole.DRIVER);

      expect(user.roles).toContain(UserRole.DRIVER);
      expect(user.roles).toHaveLength(2);
    });

    it('should allow modifying all mutable properties', () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      user.email = 'newemail@example.com';
      user.firstName = 'Jane';
      user.lastName = 'Smith';
      user.passwordHash = 'new-hash';
      user.isEmailVerified = true;
      user.isActive = false;
      user.googleId = 'google-456';

      expect(user.email).toBe('newemail@example.com');
      expect(user.firstName).toBe('Jane');
      expect(user.lastName).toBe('Smith');
      expect(user.passwordHash).toBe('new-hash');
      expect(user.isEmailVerified).toBe(true);
      expect(user.isActive).toBe(false);
      expect(user.googleId).toBe('google-456');
    });
  });
});
