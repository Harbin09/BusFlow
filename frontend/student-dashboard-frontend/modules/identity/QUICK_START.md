# Quick Start Guide - Identity Module

Get the authentication module up and running in 5 minutes.

## 1️⃣ Setup Environment (1 minute)

```bash
# Copy environment template
cp modules/identity/.env.example .env

# Edit .env with your values
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3001
```

## 2️⃣ Install Dependencies (1 minute)

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt \
  passport-google-oauth20 class-validator class-transformer uuid
```

## 3️⃣ Import Module (1 minute)

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './modules/identity/src/identity.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    IdentityModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## 4️⃣ Use in Your Controllers (1 minute)

```typescript
import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { JwtAuthGuard } from './modules/identity/src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './modules/identity/src/infrastructure/guards/roles.guard';
import { Roles } from './modules/identity/src/infrastructure/decorators/roles.decorator';
import { CurrentUser } from './modules/identity/src/infrastructure/decorators/current-user.decorator';
import { UserRole } from './modules/identity/src/domain/enums/user-role.enum';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  // Public endpoint
  @Get()
  getTrips(@CurrentUser() user: any) {
    return { userId: user.id, message: 'Your trips' };
  }

  // Admin only
  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminStats() {
    return { message: 'Admin stats' };
  }

  // Multiple roles allowed
  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DRIVER)
  assignTrip() {
    return { message: 'Trip assigned' };
  }
}
```

## 5️⃣ Run Tests (1 minute)

```bash
npm test -- modules/identity
npm test -- modules/identity --coverage
```

---

## 📡 Available Endpoints

### Authentication
```
POST   /auth/register         # Create account
POST   /auth/login            # Login with email/password
POST   /auth/refresh          # Get new access token
POST   /auth/logout           # Logout (single session)
POST   /auth/logout-all       # Logout (all devices)
GET    /auth/me               # Get current user
```

### OAuth
```
GET    /auth/google           # Start Google login
GET    /auth/google/callback  # Google redirect (automatic)
POST   /auth/oauth/login      # OAuth login
```

### Role Examples (in module)
```
GET    /auth/admin-only       # Test admin access
GET    /auth/student-only     # Test student access
GET    /auth/driver-only      # Test driver access
```

---

## 🔐 Authentication Flow

### Register & Login
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword@123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }'

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["STUDENT"]
  }
}
```

### Use Access Token
```bash
# Protected endpoint
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh Token
```bash
# Get new access token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'

# Response
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

---

## 🎯 Key Classes to Know

| Class | Purpose | Usage |
|-------|---------|-------|
| `AuthService` | Authentication logic | Inject in controllers |
| `JwtAuthGuard` | Token validation | `@UseGuards(JwtAuthGuard)` |
| `RolesGuard` | Role enforcement | `@UseGuards(RolesGuard)` |
| `CurrentUser` | Extract user data | `@CurrentUser() user` |
| `Roles` | Specify required roles | `@Roles(UserRole.ADMIN)` |
| `UserRole` | Role enumeration | `UserRole.ADMIN/STUDENT/DRIVER` |

---

## 🔑 Important Files

| File | Purpose |
|------|---------|
| `.env` | Configuration (create from .env.example) |
| `src/identity.module.ts` | Module definition |
| `src/presentation/controllers/auth.controller.ts` | API endpoints |
| `src/application/services/auth.service.ts` | Business logic |
| `test/` | 73+ unit tests |
| `README.md` | Full documentation |
| `INTEGRATION.md` | Database setup guide |

---

## ❌ Common Issues

### "JWT_SECRET is not defined"
- ✅ Copy `.env.example` to `.env`
- ✅ Add `JWT_SECRET` value

### "Cannot find module '@nestjs/jwt'"
- ✅ Run `npm install`
- ✅ Check package.json

### "401 Unauthorized"
- ✅ Use valid access token
- ✅ Token not expired (15 minutes)
- ✅ Prefix with "Bearer "

### "403 Forbidden"
- ✅ Check user has required role
- ✅ Verify @Roles() decorator
- ✅ RolesGuard is applied

---

## 📚 Learn More

- **Full Docs**: Read `README.md`
- **Integration**: Read `INTEGRATION.md`
- **Architecture**: Read `ARCHITECTURE.md`
- **Tests**: Check `test/` directory

---

## ✅ You're Ready!

The module is fully functional. Start using it:

```typescript
@UseGuards(JwtAuthGuard)
getProtectedResource() {
  return { message: 'Success' };
}
```

🎉 **That's it! You're authenticated.**

---

Need help? Check the documentation files or review the test cases for examples.
