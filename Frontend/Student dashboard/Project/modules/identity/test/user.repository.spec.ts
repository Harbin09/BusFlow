import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../src/infrastructure/repositories/user.repository';
import { User } from '../src/domain/entities/user.entity';
import { UserRole } from '../src/domain/enums/user-role.enum';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      const result = await repository.create(user);

      expect(result).toBe(user);
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should store user in repository', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      await repository.create(user);
      const found = await repository.findById('user-1');

      expect(found).toEqual(user);
    });

    it('should index user by email', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);

      await repository.create(user);
      const found = await repository.findByEmail('test@example.com');

      expect(found).toEqual(user);
    });

    it('should index user by googleId if provided', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.googleId = 'google-123';

      await repository.create(user);
      const found = await repository.findByGoogleId('google-123');

      expect(found).toEqual(user);
    });

    it('should handle case-insensitive email indexing', async () => {
      const user = new User('user-1', 'TEST@EXAMPLE.COM', 'John', 'Doe', [UserRole.STUDENT]);

      await repository.create(user);
      const found = await repository.findByEmail('test@example.com');

      expect(found).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const result = await repository.findById('user-1');

      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(user);
    });

    it('should return null if email not found', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should be case-insensitive', async () => {
      const user = new User('user-1', 'Test@Example.Com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(user);
    });
  });

  describe('findByGoogleId', () => {
    it('should find user by googleId', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.googleId = 'google-123';
      await repository.create(user);

      const result = await repository.findByGoogleId('google-123');

      expect(result).toEqual(user);
    });

    it('should return null if googleId not found', async () => {
      const result = await repository.findByGoogleId('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null if user has no googleId', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const result = await repository.findByGoogleId('google-123');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      user.firstName = 'Jane';
      user.lastName = 'Smith';
      await repository.update(user);

      const result = await repository.findById('user-1');
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should update email index on email change', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      user.email = 'newemail@example.com';
      await repository.update(user);

      const result = await repository.findByEmail('newemail@example.com');
      expect(result).toEqual(user);
    });

    it('should update googleId index when googleId is set', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      user.googleId = 'google-456';
      await repository.update(user);

      const result = await repository.findByGoogleId('google-456');
      expect(result).toEqual(user);
    });

    it('should update updatedAt timestamp', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const initialTime = user.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.firstName = 'Jane';
      await repository.update(user);

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(initialTime.getTime());
    });
  });

  describe('delete', () => {
    it('should delete user from repository', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      await repository.delete('user-1');

      const result = await repository.findById('user-1');
      expect(result).toBeNull();
    });

    it('should remove email index on delete', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      await repository.delete('user-1');

      const result = await repository.findByEmail('test@example.com');
      expect(result).toBeNull();
    });

    it('should remove googleId index on delete', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      user.googleId = 'google-123';
      await repository.create(user);

      await repository.delete('user-1');

      const result = await repository.findByGoogleId('google-123');
      expect(result).toBeNull();
    });

    it('should handle deleting non-existent user gracefully', async () => {
      await expect(repository.delete('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('findByRoles', () => {
    beforeEach(async () => {
      const student = new User('user-1', 'student@example.com', 'John', 'Doe', [
        UserRole.STUDENT,
      ]);
      const driver = new User('user-2', 'driver@example.com', 'Jane', 'Smith', [
        UserRole.DRIVER,
      ]);
      const admin = new User('user-3', 'admin@example.com', 'Admin', 'User', [UserRole.ADMIN]);
      const multiRole = new User('user-4', 'multi@example.com', 'Multi', 'Role', [
        UserRole.ADMIN,
        UserRole.DRIVER,
      ]);

      await repository.create(student);
      await repository.create(driver);
      await repository.create(admin);
      await repository.create(multiRole);
    });

    it('should find users with single role', async () => {
      const result = await repository.findByRoles([UserRole.STUDENT]);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('student@example.com');
    });

    it('should find users with any of multiple roles', async () => {
      const result = await repository.findByRoles([UserRole.ADMIN, UserRole.DRIVER]);

      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.some((u) => u.email === 'admin@example.com')).toBe(true);
      expect(result.some((u) => u.email === 'driver@example.com')).toBe(true);
      expect(result.some((u) => u.email === 'multi@example.com')).toBe(true);
    });

    it('should return empty array if no users match role', async () => {
      // Create new repository for clean test
      const cleanRepo = new UserRepository();
      const result = await cleanRepo.findByRoles([UserRole.STUDENT]);

      expect(result).toEqual([]);
    });
  });

  describe('exists', () => {
    it('should return true if email exists', async () => {
      const user = new User('user-1', 'test@example.com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const result = await repository.exists('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const result = await repository.exists('nonexistent@example.com');

      expect(result).toBe(false);
    });

    it('should be case-insensitive', async () => {
      const user = new User('user-1', 'Test@Example.Com', 'John', 'Doe', [UserRole.STUDENT]);
      await repository.create(user);

      const result = await repository.exists('test@example.com');

      expect(result).toBe(true);
    });
  });

  describe('multiple user operations', () => {
    it('should handle multiple users correctly', async () => {
      const users = [
        new User('user-1', 'user1@example.com', 'John', 'Doe', [UserRole.STUDENT]),
        new User('user-2', 'user2@example.com', 'Jane', 'Smith', [UserRole.DRIVER]),
        new User('user-3', 'user3@example.com', 'Admin', 'User', [UserRole.ADMIN]),
      ];

      for (const user of users) {
        await repository.create(user);
      }

      const found1 = await repository.findByEmail('user1@example.com');
      const found2 = await repository.findByEmail('user2@example.com');
      const found3 = await repository.findByEmail('user3@example.com');

      expect(found1.id).toBe('user-1');
      expect(found2.id).toBe('user-2');
      expect(found3.id).toBe('user-3');
    });

    it('should maintain data integrity during concurrent operations', async () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        new User(`user-${i}`, `user${i}@example.com`, `User`, `${i}`, [UserRole.STUDENT]),
      );

      await Promise.all(users.map((user) => repository.create(user)));

      const stored = await Promise.all(users.map((user) => repository.findById(user.id)));

      stored.forEach((user, index) => {
        expect(user.email).toBe(`user${index}@example.com`);
      });
    });
  });
});
