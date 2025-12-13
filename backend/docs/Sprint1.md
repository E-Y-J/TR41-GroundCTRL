# Sprint 1 — Backend Authentication System & Routing Infrastructure

**Goal:** Implement a comprehensive authentication system with JWT-based security, establish modular routing architecture, and prepare the backend for frontend integration with Firebase Firestore data operations.

---

## 1. Project & Environment Setup

- Clone repo: `https://github.com/E-Y-J/TR41-GroundCTRL`
- Navigate to backend and install dependencies
- Create `.env` in backend root with port and Firebase Admin credentials
- Backend server runs on **port 3001**

---

## 2. Branching Workflow

The project uses a **conventional branching strategy**:

- `feature/<name>` — new features
- `bugfix/<name>` — fixes
- `structure/<name>` — architecture/setup
- `hotfix/<name>` — urgent fixes

**All PRs require approval.**

---

## 3. Current Implementation Status

### ✅ Completed Features (Sprint 1 Foundation)

✅ **Modular Routing Architecture**
- Organized all routes into separate modules under `src/routes/`
- Created dedicated route files: `api.js`, `auth.js`, `health.js`, `firebase.js`
- Added main router `index.js` for route organization
- Simplified `app.js` from ~80 lines to ~30 lines

✅ **Authentication Route Infrastructure**
- Created stubbed auth endpoints (return 501 status):
  - `POST /api/v1/auth/register` - User registration
  - `POST /api/v1/auth/login` - User login
  - `POST /api/v1/auth/logout` - User logout
  - `GET /api/v1/auth/me` - User profile
- Added auth middleware stub for future JWT implementation

✅ **Enhanced Error Handling**
- Separated 404 and 500 error handling into dedicated middleware
- Improved code organization and maintainability
- Consistent error response format

✅ **Route Changes & Cleanup**
- **New**: `GET /api/v1/firebase/status` (replaces old endpoint)
- **Removed**: `GET /api/v1/firebase-status` (now returns 404)
- All other endpoints maintain original functionality

✅ **Firebase Admin SDK Integration**
- Firebase Admin SDK initialized using environment variables
- Firestore connection validation endpoint
- Secure credential handling via `.env`

✅ **Core API Endpoints**
- Base endpoint: `GET /api/v1`
- Health check: `GET /api/v1/health`
- Firebase status: `GET /api/v1/firebase/status`

### 🚀 Sprint 1 Core Features (To Be Implemented)

🔐 **Authentication System** (Sprint 1 Primary Goal)
- **User Registration**: `POST /api/v1/auth/register`
  - Input validation (email, password, name)
  - Password hashing with bcrypt
  - User creation in Firestore
  - Email verification flow
  - Duplicate user prevention

- **Login System**: `POST /api/v1/auth/login`
  - Email/password authentication
  - JWT token generation (access + refresh tokens)
  - Token expiration handling
  - Failed attempt limiting
  - Session tracking

- **Token Verification Middleware**
  - JWT token validation
  - Token expiration checking
  - User existence verification
  - Role-based access control hooks
  - Request augmentation with user data

- **User Profile**: `GET /api/v1/auth/me`
  - Authenticated user information
  - Session validation
  - User metadata retrieval
  - Profile update capability

- **Session Management**: `POST /api/v1/auth/logout`
  - Token invalidation
  - Session cleanup
  - Refresh token revocation
  - Concurrent session handling

📋 **Firestore Data Operations** (Sprint 1)
- **Users Collection CRUD**
  - Create user documents with proper schema
  - Read user data with security rules
  - Update user profiles
  - Soft delete functionality
  - Query operations for user lookup

- **Session Tracking**
  - Active session management
  - Token storage and validation
  - Session expiration handling
  - Multi-device support

- **Data Validation & Security**
  - Input sanitization
  - Schema validation
  - Firestore security rules
  - Rate limiting
  - SQL injection prevention

📋 **NoSQL Data Modeling** (Sprint 1)
- **Users Collection Schema**
  - User ID (auto-generated)
  - Email (unique, indexed)
  - Hashed password
  - Display name
  - Account creation timestamp
  - Last login timestamp
  - Email verification status
  - Account status (active/suspended)

- **Sessions Collection Schema**
  - Session ID
  - User reference
  - Token reference
  - Creation timestamp
  - Expiration timestamp
  - IP address
  - User agent
  - Device information

- **Index Requirements**
  - Email index for fast lookup
  - User ID index for profile access
  - Session token index for validation
  - Timestamp indexes for analytics

---

## 4. API Structure

Base API path:
```
/api/v1
```

### Current Available Endpoints

| Method | Route | Description | Status |
|--------|--------|-------------|--------|
| GET | `/api/v1` | Base endpoint - welcome message | ✅ Active |
| GET | `/api/v1/health` | Server health check | ✅ Active |
| GET | `/api/v1/firebase/status` | Firebase connection validation | ✅ Active |

### Authentication Endpoints (Sprint 1 Implementation)

| Method | Route | Description | Status |
|--------|--------|-------------|--------|
| POST | `/api/v1/auth/register` | Create new user account | 🚀 Sprint 1 |
| POST | `/api/v1/auth/login` | Authenticate user and return JWT token | 🚀 Sprint 1 |
| POST | `/api/v1/auth/logout` | Invalidate user session | 🚀 Sprint 1 |
| GET | `/api/v1/auth/me` | Return authenticated user information | 🚀 Sprint 1 |

### Protected Routes (Future)

| Method | Route | Description | Status |
|--------|--------|-------------|--------|
| GET | `/api/v1/users` | List all users (admin only) | 📅 Future |
| GET | `/api/v1/users/:id` | Get specific user (admin or self) | 📅 Future |
| PUT | `/api/v1/users/:id` | Update user profile | 📅 Future |
| DELETE | `/api/v1/users/:id` | Delete user account | 📅 Future |

---

## 5. Firebase Initialization

The backend uses Firebase Admin SDK initialized through environment variables:

```js
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
```

The Firebase status endpoint (`/api/v1/firebase/status`) validates the connection by attempting to list Firestore collections.

---

## 6. Environment Variables

Required `.env` variables:

```env
# Server Configuration
PORT=3001

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_KEY_CONTENT
-----END PRIVATE KEY-----
"

# JWT Configuration (Sprint 1)
JWT_SECRET=your-strong-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration (Sprint 1)
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

---

## 7. Server Lifecycle & Error Handling

### Express App Lifecycle
1. Load environment variables via `dotenv`
2. Initialize Firebase Admin SDK
3. Configure Express middleware
4. Define API routes using modular system
5. Set up error handlers
6. Export configured app

### Server Startup
1. Import configured Express app
2. Start server on specified port
3. Log available endpoints
4. Set up event listeners for graceful shutdown

### Error Handling
- **404 Handler**: Returns JSON response for undefined routes
- **Error Middleware**: Catches and logs errors, returns 500 response
- **Unhandled Rejections**: Logs and shuts down gracefully
- **Uncaught Exceptions**: Logs and shuts down gracefully
- **SIGINT Handling**: Graceful shutdown on CTRL+C

---

## 8. Project Structure

```bash
backend/
├── src/
│   ├── app.js                # Express config + Firebase initialization
│   ├── server.js             # Server entry + lifecycle management
│   ├── routes/               # Modular route system
│   │   ├── index.js          # Main router entry point
│   │   ├── api.js            # General API routes
│   │   ├── auth.js           # Authentication routes (stubbed)
│   │   ├── health.js         # Health check routes
│   │   └── firebase.js       # Firebase-related routes
│   └── middleware/           # Custom middleware
│       ├── auth.js           # Authentication middleware (stubbed)
│       └── error.js          # Error handling middleware
├── docs/
│   └── Sprint1.md            # This document
├── .env                      # Environment variables (gitignored)
├── package.json
└── README.md
```

---

## 9. Testing Requirements

### Current Testing (Completed)
- ✅ Verify server starts successfully
- ✅ Test all available endpoints
- ✅ Validate Firebase connection status
- ✅ Test error handling (404, 500)
- ✅ Confirm modular routing works
- ✅ Verify auth route stubs return 501

### Sprint 1 Testing Requirements
- **Authentication Flow**
  - Registration with validation
  - Login with JWT generation
  - Token verification
  - Protected route access
  - Session management

- **Security Testing**
  - Input validation testing
  - Rate limiting verification
  - JWT token security
  - Password hashing verification
  - CSRF protection

- **Firestore Operations**
  - User CRUD operations
  - Session management
  - Data validation
  - Error handling

- **Performance Testing**
  - Response time benchmarks
  - Load testing
  - Stress testing
  - Memory usage monitoring

---

## 10. End-of-Sprint Deliverables

### ✅ Completed (Foundation)
- Backend environment running on port 3001
- Firebase Admin SDK connected and validated
- Core API endpoints implemented
- Error handling and graceful shutdown
- **NEW**: Modular routing architecture
- **NEW**: Authentication route infrastructure
- **NEW**: Auth middleware stub
- **NEW**: Enhanced error handling
- Updated documentation reflecting actual implementation

### 🚀 Sprint 1 Deliverables
- **Authentication API** fully implemented
  - JWT-based security system
  - Password hashing with bcrypt
  - Session management
  - Token refresh mechanism

- **Firestore Integration**
  - Users collection with proper schema
  - Session tracking
  - Data validation and sanitization
  - Query operations

- **Security Enhancements**
  - Rate limiting
  - Input sanitization
  - CORS configuration
  - Helmet security headers

- **Documentation**
  - NoSQL schema documentation (`/docs/schema.md`)
  - API specification (`/docs/api.md`)
  - Security guidelines (`/docs/security.md`)

- **Testing**
  - Comprehensive authentication testing
  - Postman collection for API testing
  - Security review and hardening
  - Performance benchmarks

---

## 11. Implementation Roadmap

### Week 1: Authentication Foundation
- [ ] Implement user registration endpoint
- [ ] Implement login with JWT generation
- [ ] Create token verification middleware
- [ ] Implement user profile endpoint
- [ ] Add basic input validation

### Week 2: Security & Data Operations
- [ ] Implement password hashing
- [ ] Add rate limiting
- [ ] Implement Firestore user operations
- [ ] Add session management
- [ ] Implement token refresh

### Week 3: Testing & Documentation
- [ ] Create comprehensive test suite
- [ ] Write API documentation
- [ ] Create Postman collection
- [ ] Perform security review
- [ ] Write schema documentation

### Week 4: Finalization & Deployment
- [ ] Final testing and bug fixes
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment preparation
- [ ] Sprint review and retrospective

---

## 12. Success Metrics

### Technical Success
- ✅ Modular routing system implemented
- ✅ Authentication infrastructure in place
- ✅ All existing functionality preserved
- ✅ Improved code organization
- ✅ Enhanced error handling

### Sprint 1 Success Criteria
- 🎯 100% authentication endpoint coverage
- 🎯 JWT token implementation with refresh
- 🎯 Firestore user management
- 🎯 Comprehensive security measures
- 🎯 Full test coverage
- 🎯 Complete documentation

---

## 13. Dependencies & Requirements

### Current Dependencies
- Express.js (web framework)
- Firebase Admin SDK (Firestore access)
- Dotenv (environment variables)
- Nodemon (development)

### Sprint 1 Additional Dependencies
- `jsonwebtoken` (JWT generation/validation)
- `bcrypt` (password hashing)
- `express-rate-limit` (rate limiting)
- `helmet` (security headers)
- `cors` (CORS management)
- `joi` or `zod` (input validation)

---

## 14. Risk Assessment & Mitigation

### Potential Risks
- **Security vulnerabilities**: Mitigated by thorough testing and code review
- **Performance issues**: Mitigated by load testing and optimization
- **Firestore costs**: Mitigated by proper indexing and query optimization
- **Authentication complexity**: Mitigated by modular design and clear documentation

### Contingency Plans
- Rollback plan for failed deployments
- Backup authentication mechanism
- Monitoring and alerting setup
- Comprehensive error logging

---

## 15. Team Responsibilities

### Backend Team
- Authentication implementation
- Firestore integration
- API development
- Security implementation

### Frontend Team
- API integration
- User interface for auth flows
- Error handling
- User experience

### DevOps Team
- Deployment pipeline
- Monitoring setup
- CI/CD configuration
- Infrastructure management

---

**Sprint 1 represents a major milestone in establishing a secure, scalable authentication system that will serve as the foundation for all future backend development.**
