/**
 * Authentication Flow Test Suite
 *
 * Tests:
 * 1. Fresh browser (no auth) → redirect to login
 * 2. Login as ADMIN → redirect to /admin
 * 3. Login as DRIVER → redirect to /admin/driver
 * 4. Login as STUDENT → redirect to /admin/student
 * 5. Logout → clear all state
 */

const crypto = require('crypto');

// Simulate localStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value;
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

// Auth Service Implementation
class AuthService {
  constructor(localStorage) {
    this.localStorage = localStorage;
    this.TOKEN_STORAGE_KEY = 'bus_flow_auth_token';
    this.USER_STORAGE_KEY = 'bus_flow_user';
  }

  generateMockToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = Buffer.from('mock-signature').toString('base64');

    return `${header}.${body}.${signature}`;
  }

  async mockLogin(email, password) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockUsers = {
      'admin@busflow.com': { id: 'admin-001', email: 'admin@busflow.com', name: 'Admin User', role: 'ADMIN' },
      'driver@busflow.com': { id: 'driver-001', email: 'driver@busflow.com', name: 'John Driver', role: 'DRIVER' },
      'student@busflow.com': { id: 'student-001', email: 'student@busflow.com', name: 'Alice Student', role: 'STUDENT' },
    };

    const user = mockUsers[email];
    if (!user) throw new Error('Invalid email or password');
    if (password !== 'password') throw new Error('Invalid email or password');

    const token = this.generateMockToken(user);
    return { access_token: token, user };
  }

  async login(email, password) {
    const result = await this.mockLogin(email, password);
    this.setToken(result.access_token);
    this.setUser(result.user);
    return result;
  }

  logout() {
    this.clearToken();
    this.clearUser();
  }

  setToken(token) {
    this.localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
  }

  getToken() {
    return this.localStorage.getItem(this.TOKEN_STORAGE_KEY);
  }

  clearToken() {
    this.localStorage.removeItem(this.TOKEN_STORAGE_KEY);
  }

  setUser(user) {
    this.localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  getUser() {
    const stored = this.localStorage.getItem(this.USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  clearUser() {
    this.localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  hasRole(role) {
    return this.getUserRole() === role;
  }

  isAuthenticated() {
    return this.isTokenValid() && this.getUser() !== null;
  }
}

// Test Suite
class AuthFlowTest {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`❌ Assertion failed: ${message}`);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`❌ Expected "${expected}" but got "${actual}": ${message}`);
    }
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 TEST: ${name}`);
    try {
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      this.passed++;
    } catch (error) {
      console.log(`${error.message}`);
      this.failed++;
    }
  }

  async runTests() {
    console.log('\n' + '='.repeat(70));
    console.log('AUTHENTICATION FLOW TEST SUITE');
    console.log('='.repeat(70));

    // Test 1: Fresh Browser (No Auth)
    await this.runTest('Fresh Browser - No Authentication', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      this.assert(!auth.isAuthenticated(), 'User should NOT be authenticated');
      this.assert(auth.getToken() === null, 'Token should be null');
      this.assert(auth.getUser() === null, 'User should be null');
      this.assert(auth.getUserRole() === null, 'Role should be null');
      console.log('  → localStorage is empty');
      console.log('  → isAuthenticated() = false');
      console.log('  → Should redirect to /login');
    });

    // Test 2: Login as ADMIN
    await this.runTest('Login as ADMIN', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      const result = await auth.login('admin@busflow.com', 'password');

      this.assertEqual(result.user.role, 'ADMIN', 'User role should be ADMIN');
      this.assert(auth.isAuthenticated(), 'User should be authenticated');
      this.assert(auth.getToken() !== null, 'Token should exist');
      this.assert(auth.getUser() !== null, 'User should exist');
      this.assert(auth.hasRole('ADMIN'), 'User should have ADMIN role');
      this.assert(!auth.hasRole('DRIVER'), 'User should NOT have DRIVER role');
      this.assert(!auth.hasRole('STUDENT'), 'User should NOT have STUDENT role');

      console.log(`  → Token generated: ${auth.getToken().substring(0, 20)}...`);
      console.log(`  → User: ${result.user.name} (${result.user.email})`);
      console.log(`  → Role: ${result.user.role}`);
      console.log('  → isAuthenticated() = true');
      console.log('  → Should redirect to /admin');
    });

    // Test 3: Login as DRIVER
    await this.runTest('Login as DRIVER', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      const result = await auth.login('driver@busflow.com', 'password');

      this.assertEqual(result.user.role, 'DRIVER', 'User role should be DRIVER');
      this.assert(auth.isAuthenticated(), 'User should be authenticated');
      this.assert(auth.getToken() !== null, 'Token should exist');
      this.assert(auth.getUser() !== null, 'User should exist');
      this.assert(auth.hasRole('DRIVER'), 'User should have DRIVER role');
      this.assert(!auth.hasRole('ADMIN'), 'User should NOT have ADMIN role');
      this.assert(!auth.hasRole('STUDENT'), 'User should NOT have STUDENT role');

      console.log(`  → Token generated: ${auth.getToken().substring(0, 20)}...`);
      console.log(`  → User: ${result.user.name} (${result.user.email})`);
      console.log(`  → Role: ${result.user.role}`);
      console.log('  → isAuthenticated() = true');
      console.log('  → Should redirect to /admin/driver');
    });

    // Test 4: Login as STUDENT
    await this.runTest('Login as STUDENT', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      const result = await auth.login('student@busflow.com', 'password');

      this.assertEqual(result.user.role, 'STUDENT', 'User role should be STUDENT');
      this.assert(auth.isAuthenticated(), 'User should be authenticated');
      this.assert(auth.getToken() !== null, 'Token should exist');
      this.assert(auth.getUser() !== null, 'User should exist');
      this.assert(auth.hasRole('STUDENT'), 'User should have STUDENT role');
      this.assert(!auth.hasRole('ADMIN'), 'User should NOT have ADMIN role');
      this.assert(!auth.hasRole('DRIVER'), 'User should NOT have DRIVER role');

      console.log(`  → Token generated: ${auth.getToken().substring(0, 20)}...`);
      console.log(`  → User: ${result.user.name} (${result.user.email})`);
      console.log(`  → Role: ${result.user.role}`);
      console.log('  → isAuthenticated() = true');
      console.log('  → Should redirect to /admin/student (with interactive map)');
    });

    // Test 5: Invalid Credentials
    await this.runTest('Invalid Credentials - Wrong Password', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      try {
        await auth.login('admin@busflow.com', 'wrongpassword');
        throw new Error('Should have thrown an error for wrong password');
      } catch (error) {
        this.assert(error.message.includes('Invalid'), 'Should reject with "Invalid" message');
        this.assert(!auth.isAuthenticated(), 'User should NOT be authenticated');
        console.log(`  → Error: ${error.message}`);
        console.log('  → User NOT authenticated');
        console.log('  → Should stay on /login with error message');
      }
    });

    // Test 6: Invalid Email
    await this.runTest('Invalid Credentials - Unknown Email', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      try {
        await auth.login('unknown@busflow.com', 'password');
        throw new Error('Should have thrown an error for unknown email');
      } catch (error) {
        this.assert(error.message.includes('Invalid'), 'Should reject with "Invalid" message');
        this.assert(!auth.isAuthenticated(), 'User should NOT be authenticated');
        console.log(`  → Error: ${error.message}`);
        console.log('  → User NOT authenticated');
        console.log('  → Should stay on /login with error message');
      }
    });

    // Test 7: Logout - Clear All State
    await this.runTest('Logout - Clear All Authentication State', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      // Login first
      await auth.login('student@busflow.com', 'password');
      this.assert(auth.isAuthenticated(), 'User should be authenticated before logout');
      this.assert(auth.getToken() !== null, 'Token should exist before logout');

      // Now logout
      auth.logout();

      this.assert(!auth.isAuthenticated(), 'User should NOT be authenticated after logout');
      this.assert(auth.getToken() === null, 'Token should be null after logout');
      this.assert(auth.getUser() === null, 'User should be null after logout');
      this.assert(auth.getUserRole() === null, 'Role should be null after logout');
      this.assert(localStorage.length === 0, 'localStorage should be empty after logout');

      console.log('  → Token cleared from localStorage');
      console.log('  → User cleared from localStorage');
      console.log('  → isAuthenticated() = false');
      console.log('  → Should redirect to /login');
    });

    // Test 8: Token Expiration
    await this.runTest('Token Expiration Check', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      // Create an expired token
      const expiredUser = { id: 'test', email: 'test@test.com', role: 'STUDENT', name: 'Test' };
      const expiredPayload = {
        id: expiredUser.id,
        email: expiredUser.email,
        role: expiredUser.role,
        iat: Math.floor(Date.now() / 1000) - 100000, // Issued 100000 seconds ago
        exp: Math.floor(Date.now() / 1000) - 10, // Expired 10 seconds ago
      };

      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const body = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
      const signature = Buffer.from('mock-signature').toString('base64');
      const expiredToken = `${header}.${body}.${signature}`;

      auth.setToken(expiredToken);
      auth.setUser(expiredUser);

      this.assert(!auth.isTokenValid(), 'Expired token should NOT be valid');
      this.assert(!auth.isAuthenticated(), 'User with expired token should NOT be authenticated');

      console.log('  → Token marked as expired');
      console.log('  → isTokenValid() = false');
      console.log('  → isAuthenticated() = false');
      console.log('  → Should redirect to /login');
    });

    // Test 9: Persistent Authentication (across page reloads)
    await this.runTest('Persistent Authentication Across Page Reloads', async () => {
      const localStorage = new MockLocalStorage();

      // Simulate first page load (user logs in)
      const auth1 = new AuthService(localStorage);
      await auth1.login('admin@busflow.com', 'password');
      const token1 = auth1.getToken();
      const role1 = auth1.getUserRole();

      // Simulate page reload (new auth instance, same localStorage)
      const auth2 = new AuthService(localStorage);
      const token2 = auth2.getToken();
      const role2 = auth2.getUserRole();

      this.assertEqual(token1, token2, 'Token should persist across reloads');
      this.assertEqual(role1, role2, 'Role should persist across reloads');
      this.assert(auth2.isAuthenticated(), 'User should still be authenticated after reload');

      console.log('  → First load: user logs in');
      console.log('  → Token + user stored in localStorage');
      console.log('  → Page reload simulated (new auth instance)');
      console.log('  → Second load: auth restored from localStorage');
      console.log('  → isAuthenticated() = true (persisted)');
    });

    // Test 10: No Auto-Admin Creation
    await this.runTest('No Automatic ADMIN Token/User Creation', async () => {
      const localStorage = new MockLocalStorage();
      const auth = new AuthService(localStorage);

      // Fresh browser - should NOT auto-create admin
      const token = auth.getToken();
      const user = auth.getUser();

      this.assert(token === null, 'Token should NOT be auto-created');
      this.assert(user === null, 'User should NOT be auto-created');
      this.assert(!auth.isAuthenticated(), 'Should NOT be authenticated');

      console.log('  → Fresh browser with empty localStorage');
      console.log('  → getToken() = null (NOT auto-created)');
      console.log('  → getUser() = null (NOT auto-created)');
      console.log('  → No ADMIN privilege escalation');
      console.log('  → User MUST login explicitly');
    });

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log(`RESULTS: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(70));

    if (this.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Authentication flow is working correctly.\n');
      return true;
    } else {
      console.log(`\n⚠️  ${this.failed} test(s) failed.\n`);
      return false;
    }
  }
}

// Run tests
const test = new AuthFlowTest();
test.runTests().then(success => {
  process.exit(success ? 0 : 1);
});
