# Express API Testing Strategy by Phase
## GroundCTRL Backend – Comprehensive Test Plan

**Author's Note:** This strategy synthesizes industry best practices for Node.js/Express testing, Firebase emulator patterns, and your current project architecture (phases 0-11, identity policy, CRUD factory, mission control protocol).

---

## Table of Contents

1. [Testing Philosophy & Pyramid](#testing-philosophy--pyramid)
2. [Test Layer Architecture](#test-layer-architecture)
3. [Phase-by-Phase Testing Roadmap](#phase-by-phase-testing-roadmap)
4. [Critical Patterns & Anti-Patterns](#critical-patterns--anti-patterns)
5. [Test Utilities & Helpers](#test-utilities--helpers)
6. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy & Pyramid

Your API testing strategy follows the **Testing Pyramid** model with three layers:

```
        E2E Tests (Few)
       Integration Tests (Moderate)
      Unit Tests (Many)
```

**Layer Distribution (Recommended)**:
- **Unit Tests**: 70% (utilities, services, single functions with mocks)
- **Integration Tests**: 25% (routes with Firebase emulators, real DB, no UI)
- **E2E Tests**: 5% (critical user journeys, full stack, frontend included)

**Why This Matters for Your Project**:
- **Unit tests** are fast and catch business logic bugs early
- **Integration tests** catch middleware/route/database interaction issues (your current focus)
- **E2E tests** are slow and flaky but catch what unit/integration miss

---

## Test Layer Architecture

### Layer 1: Unit Tests (Fastest, Highest Coverage)

**What to Test**:
- Utility functions (password validation, JWT encoding/decoding, hashing)
- Service methods with mocked dependencies (authService.login mocked DB)
- Middleware logic in isolation (rate limiter, validation, auth middleware)
- Repository methods with mocked Firestore
- Factory functions with mocked inputs

**Tools**:
- **Jest** (test runner, mocking, assertions)
- **jest.mock()** for dependencies
- **jest.spyOn()** for method spying

**Pattern Example** (Unit Test):
```javascript
// src/services/__tests__/passwordValidation.test.js
describe('passwordValidation', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('short');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('8 characters');
  });
});
```

---

### Layer 2: Integration Tests (Medium Speed, Most Critical)

**What to Test**:
- Full HTTP request/response cycles with real routes
- Middleware interaction (auth → validation → response)
- Route validation and error handling
- Database/Firestore interactions (via emulator)
- Authentication flow (register → login → token → access)
- Ownership enforcement (cross-user access prevention)
- Response envelope consistency

**Tools**:
- **Jest** (test runner)
- **Supertest** (HTTP assertions on Express routes)
- **Firebase Emulator Suite** (Auth + Firestore)
- **jest-extended** (custom matchers for deep assertions)

**Why Supertest**:
- Launches Express server for each test
- Sends real HTTP requests and validates responses
- Chains assertions fluently
- Works seamlessly with Jest
- Supports authentication token passing

**Pattern Example** (Integration Test):
```javascript
// backend/tests-backend/sprint1/authenticationFlow.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth Registration', () => {
  it('registers user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'alice@example.com',
        password: 'StrongPass123!',
        callSign: 'ALICE-01'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.payload.user.uid).toBeDefined();
    expect(res.body.payload.tokens.accessToken).toBeDefined();
  });
});
```

---

### Layer 3: E2E Tests (Slowest, Critical Journeys)

**What to Test**:
- Complete user workflows (signup → login → access protected route)
- Multi-step processes (auth → session creation → command submission)
- Frontend + backend together (via browser automation)

**Tools**:
- **Cypress** or **Playwright** (browser automation)
- **Supertest** (backend-only E2E, tests full stack without browser)

**When NOT to Use E2E**:
- Testing individual error messages (unit test this)
- Testing database state (integration test)
- Testing middleware in isolation (unit test)

---

## Phase-by-Phase Testing Roadmap

### Phase 0 – Repo Hygiene (Complete)
**Status**: ✅ Documentation only, no code testing needed.

### Phase 1 – Identity Enforcement (Done)
**Status**: ✅ Manual verification; uid-based targeting works in practice.

**New Unit Tests Needed**:
```javascript
describe('Identity Enforcement', () => {
  it('prevents callSign-based lookups in userRepository', () => {
    // Verify getByCallSign method does not exist
    expect(userRepository.getByCallSign).toBeUndefined();
    expect(userRepository.getById).toBeDefined();
  });

  it('ensures all user operations use uid, not callSign', () => {
    // Verify service layer passes uid to repository
  });
});
```

### Phase 2 – Security Quick Wins (Done)
**Status**: ✅ Partially tested; need explicit integration tests.

**New Integration Tests**:
```javascript
describe('Phase 2 – Security Quick Wins', () => {
  describe('Global API Rate Limiting', () => {
    it('returns 429 after exceeding global rate limit', async () => {
      // Make 100+ rapid requests to /api/v1/* endpoints
      // Verify 429 Too Many Requests on excess
    });
  });

  describe('Auth Error Normalization', () => {
    it('returns generic error in production (no user enumeration)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'test' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid|incorrect/i);
      expect(res.body.message).not.toMatch(/not found|does not exist/);
    });
  });

  describe('Outbound HTTP Timeouts', () => {
    it('times out slow external HTTP calls', async () => {
      // Mock slow external service, expect 503 timeout error
    });
  });
});
```

### Phase 3 – Validation Layer (Done)
**Status**: ✅ Partially tested; need validation middleware tests.

**New Tests**:
```javascript
describe('Phase 3 – Validation Middleware', () => {
  it('rejects unknown fields via Zod .strict()', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'Pass123!',
        unknownField: 'should be rejected'
      });

    expect(res.status).toBe(422);
    expect(res.body.payload.details).toContainEqual(
      expect.objectContaining({ field: expect.stringContaining('unknown') })
    );
  });

  it('caps pagination limit to 100', async () => {
    const res = await request(app)
      .get('/api/v1/scenarios?limit=500')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.body.payload.pagination.limit).toBeLessThanOrEqual(100);
  });
});
```

### Phase 4 – CRUD Factory Hardening (Done)
**Status**: ✅ Tested conceptually; need comprehensive factory tests.

**New Tests**:
```javascript
describe('Phase 4 – CRUD Factory', () => {
  describe('Pagination & Response Format', () => {
    it('enforces MAX_PAGE_LIMIT = 100', async () => {
      const res = await request(app)
        .get('/api/v1/scenarios?page=1&limit=150')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.payload.pagination.limit).toBe(100);
    });

    it('returns mission-control formatted response', async () => {
      const res = await request(app)
        .get('/api/v1/scenarios')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body).toMatchObject({
        status: expect.stringMatching(/success|error|hold|abort/i),
        code: expect.any(String),
        payload: expect.objectContaining({
          items: expect.any(Array),
          pagination: expect.any(Object)
        }),
        telemetry: expect.objectContaining({
          missionTime: expect.any(String),
          operatorCallSign: expect.any(String),
          stationId: expect.any(String)
        })
      });
    });
  });

  describe('Ownership Scoping', () => {
    it('filters resources by ownership for non-admin users', async () => {
      // Non-admin user requests /api/v1/scenarios
      // Only returns scenarios where createdBy === user.uid
    });

    it('allows admin users unrestricted access', async () => {
      // Admin user requests /api/v1/scenarios
      // Returns all scenarios regardless of createdBy
    });
  });

  describe('Audit Logging', () => {
    it('logs actions with uid-based identity', async () => {
      // Mock auditRepository.logAudit
      // Create a resource
      // Verify auditRepository.logAudit called with userId = req.user.uid
    });

    it('uses "ANONYMOUS" when no authenticated user', async () => {
      // Unauthenticated POST /api/v1/something
      // Verify audit log has userId = "ANONYMOUS"
    });
  });
});
```

### Phase 5 – Satellites Domain (Done)
**Status**: ✅ Basic CRUD tested; need comprehensive test suite.

**Test Scope**:
- Create satellite (admin-only, validate required fields)
- Read satellite (by id, list with pagination)
- Update satellite (owner-only, allowed fields only)
- Delete satellite (owner-only)
- Firestore integration (persistence)
- Response format consistency

```javascript
describe('Phase 5 – Satellites Domain', () => {
  let satelliteId;
  let adminToken;

  beforeAll(async () => {
    // Register admin user and get token
    adminToken = await getAdminToken();
  });

  describe('POST /api/v1/satellites (Create)', () => {
    it('creates satellite with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/satellites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'ISS',
          orbitAltitude: 408,
          inclination: 51.6,
          type: 'CREWED'
        });

      expect(res.status).toBe(201);
      expect(res.body.payload.id).toBeDefined();
      satelliteId = res.body.payload.id;
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/satellites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'ISS' }); // missing orbitAltitude, inclination

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/satellites/:id (Read)', () => {
    it('returns satellite by id', async () => {
      const res = await request(app)
        .get(`/api/v1/satellites/${satelliteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.payload.id).toBe(satelliteId);
      expect(res.body.payload.name).toBe('ISS');
    });

    it('returns 404 for nonexistent satellite', async () => {
      const res = await request(app)
        .get('/api/v1/satellites/nonexistent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/satellites/:id (Update)', () => {
    it('updates allowed fields only', async () => {
      const res = await request(app)
        .patch(`/api/v1/satellites/${satelliteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'International Space Station' });

      expect(res.status).toBe(200);
      expect(res.body.payload.name).toBe('International Space Station');
    });

    it('prevents updating immutable fields', async () => {
      // Try to update createdAt or other immutable field
      const res = await request(app)
        .patch(`/api/v1/satellites/${satelliteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ createdAt: '2020-01-01T00:00:00Z' });

      expect(res.status).toBe(400);
      expect(res.body.payload.details).toContain('createdAt');
    });
  });

  describe('DELETE /api/v1/satellites/:id (Delete)', () => {
    it('deletes satellite', async () => {
      const res = await request(app)
        .delete(`/api/v1/satellites/${satelliteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/v1/satellites/${satelliteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});
```

### Phase 6 – Scenarios Domain (Done)
**Status**: ✅ CRUD tested; need scenario-specific validation tests.

**Test Scope**:
- Scenario CRUD with satellite FK validation
- Enum enforcement (difficulty, type)
- Response format consistency
- Ownership & access control

### Phase 7 – Scenario Steps (Done)
**Status**: ✅ CRUD tested; need step ordering tests.

**Test Scope**:
- Step ordering uniqueness (scenario_id, step_order)
- Nested route testing (/scenarios/:id/steps/:stepId)
- Step advancement validation
- Hint suggestion availability

### Phase 8 – Sessions (Done)
**Status**: ✅ CRUD tested; need session state & step progression.

**Test Scope**:
- Session creation and ownership
- Session state mutations
- Step progression validation
- Session status transitions (IN_PROGRESS → COMPLETED → etc.)

### Phase 9 – Commands (Done)
**Status**: ✅ CRUD tested; need command validation.

**Test Scope**:
- Command registry validation
- Session/step context validation
- Error tracking in session counters

### Phase 10 – NOVA AI (Done)
**Status**: ✅ Basic integration tested; need conversation persistence.

**Test Scope**:
- Message persistence
- Step-aware context composition
- Fallback hint delivery (if provider unavailable)
- Hint usage counter update

### Phase 11 – Testing & Documentation (In Progress)
**Status**: 🔄 Sprint 0 tests complete; Sprint 1 tests created but not run.

**What's Complete**:
- ✅ Firebase emulator wiring (5 tests)
- ✅ Identity enforcement patterns (5 tests)
- ✅ Security quick wins (6 tests)
- ✅ Validation layer (6 tests)
- ✅ CRUD factory (6 tests)
- ✅ Total: **28 tests passing**

**What's Pending**:
- Sprint 1 authentication flows (15+ tests)
- Sprint 1 security headers (11+ tests)
- Sprint 1 Firestore rules (12+ tests)
- Sprint 1 scenario visibility (15+ tests)

---

## Critical Patterns & Anti-Patterns

### ✅ Best Practices

#### 1. **Use Firebase Emulator Suite for Integration Tests**

```javascript
// jest.setup.js or beforeAll hook
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.NODE_ENV = 'test';

// Tests use these environment variables automatically
// No need to mock Firebase—it connects to the emulator
```

**Why**: Real Firebase interactions without hitting production, full test isolation, fast cleanup between tests.

#### 2. **Separate Concerns: Unit vs. Integration**

```javascript
// ❌ DON'T: Unit test with real DB
it('finds user by email', async () => {
  const user = await userRepository.getByEmail('test@test.com');
  expect(user).toBeDefined();
}); // This is integration, not unit!

// ✅ DO: Unit test with mock
it('finds user by email', () => {
  const mockDB = { getByEmail: jest.fn().mockResolvedValue({ id: '123' }) };
  const repo = new UserRepository(mockDB);
  const user = await repo.getByEmail('test@test.com');
  expect(user.id).toBe('123');
  expect(mockDB.getByEmail).toHaveBeenCalledWith('test@test.com');
});
```

#### 3. **Test the Full Request/Response Cycle with Supertest**

```javascript
// ✅ DO: Test the complete flow
it('logs in user and returns JWT in Authorization header', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'test@test.com', password: 'Pass123!' });

  expect(res.status).toBe(200);
  expect(res.body.payload.tokens.accessToken).toBeDefined();
  
  // Verify token works on protected routes
  const protectedRes = await request(app)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${res.body.payload.tokens.accessToken}`);
  
  expect(protectedRes.status).toBe(200);
});
```

#### 4. **Async/Await in beforeAll for Token Setup**

```javascript
// ✅ DO: Async setup for shared state
let authToken;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'test@test.com', password: 'Pass123!' });
  
  authToken = res.body.payload.tokens.accessToken;
});

it('accesses protected route with token', async () => {
  const res = await request(app)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${authToken}`);
  
  expect(res.status).toBe(200);
});
```

#### 5. **Validate Response Envelope Structure**

```javascript
// ✅ DO: Assert mission-control format consistency
it('returns mission-control formatted response', async () => {
  const res = await request(app)
    .get('/api/v1/scenarios')
    .set('Authorization', `Bearer ${token}`);

  expect(res.body).toMatchObject({
    status: expect.stringMatching(/success|error|hold|abort/i),
    code: expect.any(String),
    payload: expect.any(Object),
    telemetry: expect.objectContaining({
      missionTime: expect.any(String),
      operatorCallSign: expect.any(String),
      stationId: expect.any(String),
      requestId: expect.any(String)
    }),
    timestamp: expect.any(String),
    meta: expect.any(Object)
  });
});
```

#### 6. **Clean Up Test Data Between Tests**

```javascript
// ✅ DO: Reset database after each test
afterEach(async () => {
  const db = admin.firestore();
  
  // Clear test collections
  const testCollections = ['users', 'satellites', 'scenarios'];
  for (const collection of testCollections) {
    const snapshot = await db.collection(collection)
      .where('email', '==', 'test@example.com')
      .get();
    
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  }
});
```

#### 7. **Mock Only External Dependencies**

```javascript
// ✅ DO: Mock external services, not your code
jest.mock('../src/utils/emailService');
jest.mock('../src/services/novaService'); // External AI provider

// ❌ DON'T: Mock your own middleware/routes
// jest.mock('../src/middleware/authMiddleware'); // Bad! Test the real thing
```

#### 8. **Use Descriptive Test Names & Organize with describe()**

```javascript
// ✅ DO: Clear, organized test structure
describe('POST /api/v1/auth/login', () => {
  describe('Success Scenarios', () => {
    it('returns 200 with JWT token when credentials valid', async () => {});
    it('sets HttpOnly refresh cookie on successful login', async () => {});
  });

  describe('Error Scenarios', () => {
    it('returns 401 with generic error on invalid password', async () => {});
    it('returns 401 on nonexistent email', async () => {});
    it('returns 423 when account locked after 5 failed attempts', async () => {});
  });

  describe('Validation Errors', () => {
    it('returns 422 when email missing', async () => {});
    it('returns 422 when password too short', async () => {});
  });
});
```

### ❌ Anti-Patterns to Avoid

#### 1. **Don't Test Implementation Details**

```javascript
// ❌ BAD: Tests implementation, not behavior
it('calls userService.getByEmail with email parameter', () => {
  const spy = jest.spyOn(userService, 'getByEmail');
  // ... test ...
  expect(spy).toHaveBeenCalledWith('test@test.com');
  // If service refactors, test breaks even if behavior is same!
});

// ✅ GOOD: Test the outcome
it('returns user profile when authenticated', async () => {
  const res = await request(app)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${token}`);

  expect(res.body.payload.email).toBe('test@example.com');
  expect(res.body.payload.uid).toBeDefined();
});
```

#### 2. **Don't Skip Integration Tests (Everything Mocked)**

```javascript
// ❌ BAD: All mocks = no real testing
jest.mock('firebase-admin');
jest.mock('express');
jest.mock('../src/services/userService');
jest.mock('../src/middleware/authMiddleware');
// Now test doesn't verify anything real!

// ✅ GOOD: Real emulators, mock only external APIs
// Use Firebase emulator for Auth/Firestore
// Mock only: email service, AI provider, external APIs
```

#### 3. **Don't Ignore Error Cases**

```javascript
// ❌ BAD: Only happy path
it('registers user', async () => {
  const res = await request(app).post('/api/v1/auth/register').send({...});
  expect(res.status).toBe(201);
});

// ✅ GOOD: Happy path + edge cases + errors
describe('POST /api/v1/auth/register', () => {
  it('registers user with valid data', async () => { /* ... */ });
  it('returns 422 when email invalid format', async () => { /* ... */ });
  it('returns 409 when email already exists', async () => { /* ... */ });
  it('returns 422 when password too short', async () => { /* ... */ });
  it('returns 400 when unknown fields present', async () => { /* ... */ });
});
```

#### 4. **Don't Make Tests Interdependent**

```javascript
// ❌ BAD: Test order matters, sharing state
let userId;
it('1. creates user', async () => {
  const res = await request(app).post('/api/v1/auth/register').send({...});
  userId = res.body.payload.uid; // Storing in outer scope!
});

it('2. updates user', async () => {
  // Depends on test 1 running first
  await request(app).patch(`/api/v1/users/${userId}`).send({...});
});

// ✅ GOOD: Each test is independent
describe('User CRUD', () => {
  it('creates, reads, and updates user', async () => {
    // Create
    const createRes = await request(app).post('/api/v1/auth/register').send({...});
    const userId = createRes.body.payload.uid;

    // Read
    const getRes = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);

    // Update
    const updateRes = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ displayName: 'New Name' });
    expect(updateRes.status).toBe(200);
  });
});
```

#### 5. **Don't Hardcode Test Data**

```javascript
// ❌ BAD: Hardcoded, brittle
it('creates user', async () => {
  const res = await request(app).post('/api/v1/auth/register').send({
    email: 'alice@example.com',
    password: 'AlicePassword123!'
  });
});

// ✅ GOOD: Parameterized, reusable
const TEST_DATA = {
  user: {
    email: `test-${Date.now()}@example.com`,
    password: 'ValidPassword123!',
    callSign: `TEST-${Math.random().toString(36).substring(7).toUpperCase()}`
  }
};

it('creates user with unique email', async () => {
  const res = await request(app).post('/api/v1/auth/register').send(TEST_DATA.user);
  expect(res.status).toBe(201);
});
```

#### 6. **Don't Test Third-Party Libraries**

```javascript
// ❌ BAD: Testing Firebase SDK internals
it('JWT has exp claim', () => {
  const token = jwt.sign({ uid: '123' }, 'secret', { expiresIn: '15m' });
  const decoded = jwt.decode(token);
  expect(decoded.exp).toBeDefined(); // Testing jwt library, not your code!
});

// ✅ GOOD: Test your code's usage of the library
it('verifies expired tokens are rejected', async () => {
  // Create expired token somehow
  const res = await request(app)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${expiredToken}`);

  expect(res.status).toBe(401);
  expect(res.body.message).toContain('expired');
});
```

---

## Test Utilities & Helpers

### Test Database Seeding Helper

```javascript
// tests-backend/helpers/seedTestData.js
const admin = require('firebase-admin');

async function seedUser(overrides = {}) {
  const db = admin.firestore();
  const email = `test-${Date.now()}@example.com`;
  
  const userData = {
    email,
    callSign: `TEST-${Math.random().toString(36).substring(7)}`,
    displayName: 'Test User',
    role: 'standard',
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    ...overrides
  };

  const userRecord = await admin.auth().createUser({
    email,
    password: 'TestPass123!',
    displayName: userData.displayName
  });

  await db.collection('users').doc(userRecord.uid).set(userData);
  return { uid: userRecord.uid, email, ...userData };
}

async function seedScenario(userId, overrides = {}) {
  const db = admin.firestore();
  
  const scenarioData = {
    title: 'Test Scenario',
    description: 'A test scenario',
    difficulty: 'EASY',
    type: 'GUIDED',
    isActive: true,
    isPublic: true,
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    ...overrides
  };

  const docRef = await db.collection('scenarios').add(scenarioData);
  return { id: docRef.id, ...scenarioData };
}

module.exports = { seedUser, seedScenario };
```

### Authentication Helper

```javascript
// tests-backend/helpers/auth.js
const request = require('supertest');
const app = require('../../src/app');

async function registerTestUser(email = null, password = 'TestPass123!') {
  const testEmail = email || `test-${Date.now()}@example.com`;
  
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: testEmail,
      password,
      callSign: `TEST-${Date.now()}`
    });

  if (res.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(res.body)}`);
  }

  return {
    user: res.body.payload.user,
    token: res.body.payload.tokens.accessToken,
    email: testEmail,
    password
  };
}

async function loginUser(email, password) {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  }

  return {
    user: res.body.payload.user,
    token: res.body.payload.tokens.accessToken
  };
}

module.exports = { registerTestUser, loginUser };
```

### Response Assertion Helper

```javascript
// tests-backend/helpers/assertions.js
function expectMissionControlFormat(response) {
  expect(response.body).toMatchObject({
    status: expect.stringMatching(/success|error|hold|abort/i),
    code: expect.any(String),
    payload: expect.any(Object),
    telemetry: expect.objectContaining({
      missionTime: expect.any(String),
      operatorCallSign: expect.any(String),
      stationId: expect.any(String),
      requestId: expect.any(String)
    }),
    timestamp: expect.any(String),
    meta: expect.objectContaining({
      timestamp: expect.any(String)
    })
  });
}

function expectPaginationFormat(pagination) {
  expect(pagination).toMatchObject({
    page: expect.any(Number),
    limit: expect.any(Number),
    total: expect.any(Number),
    totalPages: expect.any(Number),
    hasNextPage: expect.any(Boolean),
    hasPrevPage: expect.any(Boolean)
  });
  expect(pagination.limit).toBeLessThanOrEqual(100);
}

module.exports = { expectMissionControlFormat, expectPaginationFormat };
```

### Cleanup Helper

```javascript
// tests-backend/helpers/cleanup.js
const admin = require('firebase-admin');

async function cleanupUser(uid) {
  const db = admin.firestore();
  
  // Delete user collections
  const collectionsToClean = [
    { collection: 'users', where: { uid } },
    { collection: 'loginAttempts', where: { userId: uid } },
    { collection: 'auditLogs', where: { userId: uid } }
  ];

  for (const { collection, where } of collectionsToClean) {
    let query = db.collection(collection);
    Object.entries(where).forEach(([field, value]) => {
      query = query.where(field, '==', value);
    });

    const snapshot = await query.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  }

  // Delete auth user
  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    if (!error.message.includes('No user record found')) {
      throw error;
    }
  }
}

async function cleanupDatabase(collections = []) {
  const db = admin.firestore();
  
  for (const collection of collections) {
    const snapshot = await db.collection(collection).get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  }
}

module.exports = { cleanupUser, cleanupDatabase };
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Backend

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      firebase-emulator:
        image: firebase:latest
        ports:
          - 8080:8080
          - 9099:9099

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start Firebase emulators
        run: firebase emulators:start &
        working-directory: ./backend
      
      - name: Wait for emulators
        run: sleep 10
      
      - name: Run Sprint 0 tests
        run: npm test -- tests-backend/sprint0
        working-directory: ./backend
        env:
          NODE_ENV: test
          FIREBASE_AUTH_EMULATOR_HOST: localhost:9099
          FIRESTORE_EMULATOR_HOST: localhost:8080
      
      - name: Run Sprint 1 tests
        run: npm test -- tests-backend/sprint1
        working-directory: ./backend
        env:
          NODE_ENV: test
          FIREBASE_AUTH_EMULATOR_HOST: localhost:9099
          FIRESTORE_EMULATOR_HOST: localhost:8080
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend
```

### Jest Configuration

```javascript
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests-backend/**/*.test.js'],
  setupFiles: ['<rootDir>/tests-backend/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 1 // Firebase emulator doesn't support parallel tests
};
```

### Test Execution Script

```bash
#!/bin/bash
# scripts/test-all.sh

set -e

echo "🧪 Starting Firebase emulators..."
firebase emulators:start --import=emulator-data &
EMULATOR_PID=$!

# Wait for emulators to start
sleep 5

echo "🚀 Running Sprint 0 tests..."
npm run test:sprint0

echo "🚀 Running Sprint 1 tests..."
npm run test:sprint1

echo "🧹 Cleaning up emulators..."
kill $EMULATOR_PID

echo "✅ All tests passed!"
```

---

## Summary & Action Items

### Immediate Actions (Week 1)

1. **Set up test infrastructure**
   - Copy helpers to `tests-backend/helpers/`
   - Configure Jest with emulator settings
   - Add GitHub Actions workflow

2. **Run Sprint 1 tests**
   - Start emulators: `firebase emulators:start`
   - Run tests: `npm test -- tests-backend/sprint1`
   - Document failures and fix implementation gaps

3. **Add missing unit tests**
   - Create `src/__tests__/` directories
   - Test services, middleware, utilities with mocks
   - Aim for 70% unit test coverage

### Short-term (Weeks 2-4)

4. **Complete Sprint 1 test suite**
   - All authentication flows passing
   - Security headers verified
   - Firestore rules validated
   - Scenario visibility tested

5. **Add integration tests for Phases 2-10**
   - Follow the test patterns above
   - Use helpers for seeding, cleanup, assertions
   - Aim for 25% integration test coverage

### Ongoing

6. **Maintain test discipline**
   - Every PR requires tests
   - Tests must pass before merging
   - Update tests when requirements change
   - Monitor coverage trends

---

**This strategy ensures your backend is production-ready, maintainable, and free of regressions.**