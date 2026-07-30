# Integration Guide - Identity Module

Complete step-by-step guide to integrate the Authentication Module into your BUS FLOW application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Integration Steps](#integration-steps)
5. [Database Setup](#database-setup)
6. [Testing Integration](#testing-integration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Dependencies
```bash
npm install @nestjs/common @nestjs/jwt @nestjs/passport passport passport-jwt passport-google-oauth20 class-validator class-transformer uuid
npm install -D @types/passport-jwt @types/passport-google-oauth20
```

### Required Environment Setup
- Node.js 16+
- NestJS 9+
- PostgreSQL (for production) or any database supporting your User model

## Installation

### Step 1: Copy Module Files
The Identity module is pre-built at `modules/identity/`. No additional setup needed.

### Step 2: Install Dependencies
```bash
npm install
```

## Configuration

### Step 1: Environment Variables
Create `.env` in project root:
```env
# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production-at-least-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Application
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

### Step 2: Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Configure authorized redirect URIs: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

## Integration Steps

### Step 1: Import IdentityModule in AppModule
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './modules/identity/src/identity.module';
import { TripsModule } from './modules/trips/src/trips.module';
import { FleetModule } from './modules/fleet/src/fleet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    IdentityModule,
    // Other modules
    TripsModule,
    FleetModule,
  ],
})
export class AppModule {}
```

### Step 2: Protect Your Routes

#### Example: Trips Module Controller
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/identity/src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/identity/src/infrastructure/guards/roles.guard';
import { Roles } from '../modules/identity/src/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../modules/identity/src/infrastructure/decorators/current-user.decorator';
import { UserRole } from '../modules/identity/src/domain/enums/user-role.enum';
import { TripsService } from './trips.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  getTrips(@CurrentUser() user: any) {
    return this.tripsService.getTripsByUserId(user.id);
  }

  @Get('admin-stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminStats() {
    return this.tripsService.getAdminStatistics();
  }
}
```

#### Example: Fleet Module Controller
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/identity/src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/identity/src/infrastructure/guards/roles.guard';
import { Roles } from '../modules/identity/src/infrastructure/decorators/roles.decorator';
import { UserRole } from '../modules/identity/src/domain/enums/user-role.enum';
import { FleetService } from './fleet.service';

@Controller('fleet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DRIVER)
  getFleet() {
    return this.fleetService.getFleetData();
  }
}
```

### Step 3: Configure CORS (if needed)
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}

bootstrap();
```

## Database Setup

### Option 1: Switch from In-Memory to PostgreSQL (Recommended)

#### Step 1: Create User Entity for TypeORM
```typescript
// modules/identity/src/infrastructure/persistence/user.typeorm-entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { unique: true, length: 255 })
  email: string;

  @Column('varchar', { length: 255 })
  firstName: string;

  @Column('varchar', { length: 255 })
  lastName: string;

  @Column('text', { nullable: true })
  passwordHash: string;

  @Column('simple-array')
  roles: string[];

  @Column('boolean', { default: false })
  isEmailVerified: boolean;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('varchar', { nullable: true, unique: true, length: 255 })
  googleId: string;

  @Column('int', { default: 0 })
  tokenVersion: number;

  @Column('timestamp', { nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Step 2: Create TypeORM Repository Implementation
```typescript
// modules/identity/src/infrastructure/repositories/user.typeorm-repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../application/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserEntity } from '../persistence/user.typeorm-entity';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const entity = this.userRepository.create({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      googleId: user.googleId,
      tokenVersion: user.tokenVersion,
      lastLoginAt: user.lastLoginAt,
    });

    await this.userRepository.save(entity);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { id } });
    return entity ? this.mapEntityToUser(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { email } });
    return entity ? this.mapEntityToUser(entity) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({ where: { googleId } });
    return entity ? this.mapEntityToUser(entity) : null;
  }

  async update(user: User): Promise<User> {
    await this.userRepository.update(user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      googleId: user.googleId,
      tokenVersion: user.tokenVersion,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
    });

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByRoles(roles: UserRole[]): Promise<User[]> {
    const entities = await this.userRepository.find();
    return entities
      .filter((entity) => roles.some((role) => entity.roles.includes(role)))
      .map((entity) => this.mapEntityToUser(entity));
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  private mapEntityToUser(entity: UserEntity): User {
    const user = new User(
      entity.id,
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.roles as UserRole[],
      entity.isEmailVerified,
      entity.isActive,
    );
    user.passwordHash = entity.passwordHash;
    user.googleId = entity.googleId;
    user.tokenVersion = entity.tokenVersion;
    user.lastLoginAt = entity.lastLoginAt;
    user.createdAt = entity.createdAt;
    user.updatedAt = entity.updatedAt;
    return user;
  }
}
```

#### Step 3: Update Module to Use TypeORM
```typescript
// modules/identity/src/identity.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { TokenService } from './application/services/token.service';

// ... other imports ...

import { UserEntity } from './infrastructure/persistence/user.typeorm-entity';
import { UserTypeOrmRepository } from './infrastructure/repositories/user.typeorm-repository';
import { IUserRepository } from './application/ports/user.repository.port';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleOAuthStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
    RolesGuard,
    GoogleOAuthGuard,
    {
      provide: IUserRepository,
      useClass: UserTypeOrmRepository,
    },
  ],
  exports: [
    AuthService,
    TokenService,
    JwtAuthGuard,
    RefreshTokenGuard,
    RolesGuard,
    GoogleOAuthGuard,
    IUserRepository,
  ],
})
export class IdentityModule {}
```

## Testing Integration

### Run Module Tests
```bash
npm test -- modules/identity
```

### Integration Test Example
```typescript
// test/auth.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password@123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password@123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user with valid token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password@123',
        });

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .expect(200);
    });
  });
});
```

## Troubleshooting

### Common Issues

#### 1. JWT_SECRET not found
**Error**: `Error: JWT_SECRET is not defined`
**Solution**: Ensure `.env` file exists and `JWT_SECRET` is set

#### 2. Google OAuth not working
**Error**: `Invalid OAuth credentials`
**Solution**:
- Verify Client ID and Secret in `.env`
- Check Google Callback URL matches configuration
- Ensure Google+ API is enabled in Cloud Console

#### 3. Role-based access denied
**Error**: `403 Forbidden - Insufficient permissions`
**Solution**:
- Verify user has correct role assigned
- Check `@Roles()` decorator is used
- Ensure `RolesGuard` is applied to route

#### 4. Token expired errors
**Error**: `401 Unauthorized - Token expired`
**Solution**:
- Use refresh endpoint to get new access token
- Verify JWT_REFRESH_SECRET is set
- Check token expiration time

#### 5. CORS errors
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution**:
- Configure CORS in `main.ts`
- Add frontend URL to allowed origins
- Ensure credentials: true if needed

### Debug Mode
Set environment variables for debugging:
```bash
DEBUG=identity:* npm start
```

---

For more information, see [README.md](./README.md) and [module documentation](../../docs/)
