# Test Structure Overview

## Test Organization

```
backend/tests/
├── unit/              # Isolated component tests
├── integration/       # API & service interaction tests
├── security/          # Security hardening tests
├── ci-cd/            # Pipeline & dependency tests
├── performance/      # Load & performance tests
└── helpers/          # Test utilities
```

## Unit Tests (`unit/`)

**Purpose:** Test individual components in isolation

- `config/firebase.test.js` - Firebase initialization & config
- `validation/schema-validation.test.js` - Zod schema validation
- `crud/crud-factory.test.js` - CRUD factory patterns

## Integration Tests (`integration/`)

**Purpose:** Test API endpoints & service interactions

- `auth/` - Authentication flows (login, register, token refresh)
- `domain/` - Domain-specific operations (satellites, scenarios, sessions)
- `firebase/` - Firebase security rules & emulator tests

## Security Tests (`security/`)

**Purpose:** Validate security hardening measures

### Validation (`security/validation/`)
- `injection.test.js` - SQL/NoSQL injection prevention
- `input-validation.test.js` - Input sanitization & validation
- `ownership-crud.test.js` - UID-based ownership enforcement
- `no-callSign-lookup.test.js` - Prevents callSign-based queries
- `zod-strict-schema.test.js` - Strict schema validation
- `query-caps.test.js` - Query parameter limits
- `sort-whitelist.test.js` - Whitelisted sort fields only
- `body-size-limit.test.js` - Request body size limits

### Rate Limiting (`security/rate-limit/`)
- `rate-limiting.test.js` - Global rate limits
- `login-composite-key.test.js` - IP+Email composite key limiting
- `help-ai-strict-limit.test.js` - AI endpoint rate limits
- `rate-limit-memory-leak.test.js` - Memory leak prevention
- `rate-limit-concurrent.test.js` - Concurrent request handling

### Authentication (`security/auth/`)
- `authentication.test.js` - Auth flows & token validation
- `auth-error-normalization.test.js` - Consistent error responses
- `token-revocation.test.js` - Token blacklist & revocation

### HTTP Security (`security/headers/`)
- `cors-cache-maxage.test.js` - CORS configuration
- `cookie-max-age.test.js` - Cookie security settings
- `security-headers.test.js` - Security headers (CSP, HSTS, etc.)

### Audit (`security/audit/`)
- `audit-anonymous.test.js` - Anonymous user tracking
- `audit-custom-metadata.test.js` - Custom audit metadata
- `audit-timestamp.test.js` - Audit timestamp accuracy

## CI/CD Tests (`ci-cd/`)

**Purpose:** Validate build, lint, and deployment processes

- `dependency-pinning.test.js` - Lock file integrity
- `linting.test.js` - ESLint compliance
- `pipeline.test.js` - CI/CD workflow validation

## Performance Tests (`performance/`)

**Purpose:** Validate performance under load

- Load testing
- Memory profiling
- Response time benchmarks

## Running Tests

```bash
# All tests
npm test

# By category
npm run test:unit
npm run test:integration
npm run test:security

# Specific file
npm test -- path/to/test.test.js

# With coverage
npm run test:coverage
```

## Why This Structure?

1. **Clear Separation:** Unit, integration, security, and CI/CD concerns separated
2. **Security First:** Dedicated security test suite ensures hardening measures work
3. **UID Enforcement:** Tests validate no callSign lookups occur (identity-by-UID only)
4. **Rate Limit Validation:** Ensures DoS protection and fair usage
5. **CI/CD Integration:** Automated validation on every PR

## Key Testing Principles

- ✅ **UID-only operations** - No callSign-based queries
- ✅ **Rate limiting** - All endpoints protected
- ✅ **Input validation** - Zod strict mode enforced
- ✅ **Ownership scoping** - Users only access their data
- ✅ **Error normalization** - Consistent error responses
- ✅ **Audit logging** - All operations tracked by UID

## Documentation

- **QUICKSTART.md** - Fast setup & common commands
- **TESTING_GUIDE.md** - Comprehensive testing documentation
- **AUTOMATION_SUMMARY.md** - What's been automated
- **CODEQL_ANALYSIS.md** - Security analysis configuration
- **CI_CD_FIREBASE_TESTS.md** - Firebase test configuration
