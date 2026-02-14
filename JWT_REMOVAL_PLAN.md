# JWT Removal Plan - Switch to Firebase Auth Only

## Problem
Production registration fails with 500 error due to missing `JWT_SECRET`, even though:
- User is created in Firebase Auth ✅
- User document created in Firestore ✅
- Role set to "beta" correctly ✅
- JWT token generation fails ❌

**Root Cause:** Custom JWT implementation duplicates Firebase Auth's built-in token system.

## Solution
Remove custom JWT entirely and use Firebase Auth tokens exclusively.

---

## Architecture Change

### Current Flow (Broken)
```
1. User registers → Firebase Auth creates user
2. Backend creates Firestore user document
3. Backend tries to generate custom JWT → FAILS (no JWT_SECRET)
4. 500 error returned to frontend
```

### New Flow (Simplified)
```
1. User registers → Firebase Auth creates user
2. Backend creates Firestore user document
3. Return success (no custom token needed)
4. Frontend uses Firebase Auth token directly
5. Backend validates Firebase tokens on protected routes
```

---

## Benefits
1. ✅ **No JWT_SECRET needed** - eliminates production config issues
2. ✅ **Simplified architecture** - one auth system instead of two
3. ✅ **Better security** - Firebase tokens are industry-standard
4. ✅ **Auto token refresh** - Firebase SDK handles it
5. ✅ **Reduced code** - remove custom JWT logic

---

## Implementation Steps

### Phase 1: Backend Changes

#### 1.1 Remove JWT Dependencies
**Files to modify:**
- `backend/package.json` - Remove `jsonwebtoken` dependency
- `backend/src/utils/jwt.js` - DELETE file
- `backend/apphosting.yaml` - Remove JWT_SECRET reference

#### 1.2 Update Auth Service
**File:** `backend/src/services/authService.js`

**Changes:**
```javascript
// REMOVE: JWT token generation
// const { token, expiresIn } = jwtUtils.createAccessToken(user);

// NEW: Just return user data
async register(email, password, displayName) {
  // ... existing user creation ...
  
  return {
    user: {
      uid: userRecord.uid,
      email: userRecord.email,
      callSign: userDoc.callSign,
      role: userDoc.role,
      displayName: userDoc.displayName
    }
    // NO token needed - Firebase SDK handles it
  };
}

async login(email, password) {
  // ... existing validation ...
  
  return {
    user: {
      uid: userDoc.uid,
      email: userDoc.email,
      callSign: userDoc.callSign,
      role: userDoc.role,
      displayName: userDoc.displayName
    }
    // NO token needed - Firebase SDK handles it
  };
}
```

#### 1.3 Update Auth Controller
**File:** `backend/src/controllers/authController.js`

**Changes:**
```javascript
async register(req, res, next) {
  try {
    const result = await authService.register(/* ... */);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result.user
      // NO token in response
    });
  } catch (error) {
    next(error);
  }
}
```

#### 1.4 Update Auth Middleware
**File:** `backend/src/middleware/auth.js`

**Current:** Validates custom JWT tokens  
**New:** Validate Firebase Auth tokens

```javascript
const admin = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    req.user = {
      uid: decodedToken.uid,
      ...userDoc.data()
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role-based middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = { authenticateToken, requireRole };
```

### Phase 2: Frontend Changes

#### 2.1 Update Auth Context
**File:** `frontend/src/contexts/AuthContext.jsx`

**Changes:**
```javascript
// After Firebase signInWithEmailAndPassword or createUserWithEmailAndPassword
const user = userCredential.user;

// Get Firebase ID token
const idToken = await user.getIdToken();

// Fetch additional user data from backend
const response = await fetch(`${API_URL}/auth/me`, {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});

const userData = await response.json();

// Store user data in context
setUser({
  ...user,
  ...userData
});
```

#### 2.2 Update API Client
**File:** `frontend/src/lib/api.js`

**Changes:**
```javascript
import { auth } from '../config/firebase';

export const apiClient = {
  async request(endpoint, options = {}) {
    try {
      // Get current Firebase user
      const user = auth.currentUser;
      
      if (user) {
        // Get fresh Firebase ID token
        const idToken = await user.getIdToken();
        
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${idToken}`
        };
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, options);
      return response.json();
    } catch (error) {
      throw error;
    }
  }
};
```

#### 2.3 Remove Custom Token Storage
**Remove from:**
- localStorage token storage
- Custom token refresh logic
- Token expiry checks

**Firebase SDK handles all of this automatically!**

### Phase 3: Route Protection

#### 3.1 Update Protected Routes
**All protected backend routes:**
```javascript
router.get('/scenarios', 
  authenticateToken,           // Validates Firebase token
  requireRole(['beta', 'user', 'admin']),  // Check role
  scenarioController.getAll
);

router.post('/admin/users',
  authenticateToken,
  requireRole(['admin']),      // Admin only
  adminController.createUser
);
```

### Phase 4: Testing

#### 4.1 Test Registration Flow
1. Register new user
2. Verify no 500 error
3. Verify user created in Firebase Auth
4. Verify user document in Firestore
5. Verify frontend receives user data

#### 4.2 Test Login Flow
1. Login with existing user
2. Verify Firebase token obtained
3. Verify protected routes work
4. Verify role-based access control

#### 4.3 Test Token Refresh
1. Let Firebase token expire (1 hour)
2. Make API request
3. Verify Firebase SDK auto-refreshes token
4. Verify request succeeds

---

## Files to Modify

### Backend (Delete/Modify)
```
DELETE:
- backend/src/utils/jwt.js

MODIFY:
- backend/package.json (remove jsonwebtoken)
- backend/src/services/authService.js
- backend/src/controllers/authController.js
- backend/src/middleware/auth.js
- backend/apphosting.yaml (remove JWT_SECRET)
```

### Frontend (Modify)
```
MODIFY:
- frontend/src/contexts/AuthContext.jsx
- frontend/src/lib/api.js
- frontend/src/hooks/use-auth.jsx
```

---

## Migration Checklist

### Preparation
- [ ] Create feature branch: `feature/remove-jwt-use-firebase-auth`
- [ ] Back up current authentication code
- [ ] Document current token flow

### Backend Implementation
- [ ] Remove JWT dependencies from package.json
- [ ] Delete jwt.js utility file
- [ ] Update authService.register() - remove token generation
- [ ] Update authService.login() - remove token generation
- [ ] Update authController responses - remove token
- [ ] Rewrite auth middleware to use Firebase tokens
- [ ] Add role-based middleware
- [ ] Remove JWT_SECRET from apphosting.yaml
- [ ] Remove JWT environment variables

### Frontend Implementation
- [ ] Update AuthContext to use Firebase tokens
- [ ] Update API client to get Firebase tokens
- [ ] Remove custom token storage
- [ ] Remove custom token refresh logic
- [ ] Update all API calls to use new pattern
- [ ] Test auto token refresh

### Testing
- [ ] Test registration flow locally
- [ ] Test login flow locally
- [ ] Test protected routes locally
- [ ] Test role-based access control
- [ ] Test beta user restrictions
- [ ] Run E2E tests
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production

### Cleanup
- [ ] Remove old JWT-related code comments
- [ ] Update documentation
- [ ] Update API documentation
- [ ] Commit and push changes
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main

---

## Risk Mitigation

### Existing Users
- No migration needed! Users can re-login to get Firebase token
- Session data preserved in Firestore
- No data loss

### Rollback Plan
If issues arise:
1. Revert commits
2. Redeploy previous version
3. Re-add JWT_SECRET to production

### Beta Testing
1. Test with small group first
2. Monitor error logs
3. Verify no authentication failures
4. Gradual rollout

---

## Timeline Estimate

- **Preparation:** 30 minutes
- **Backend changes:** 2 hours
- **Frontend changes:** 2 hours
- **Testing:** 1 hour
- **Deployment:** 30 minutes
- **Total:** ~6 hours

---

## Success Criteria

✅ Registration works without 500 errors  
✅ No JWT_SECRET needed in production  
✅ All protected routes work correctly  
✅ Role-based access control works  
✅ Token refresh happens automatically  
✅ All E2E tests pass  
✅ Production deployment successful

---

## Notes

- Firebase tokens expire after 1 hour but SDK auto-refreshes
- Firebase tokens are cryptographically signed by Google
- No secret management needed
- Better security than custom JWT
- Industry standard solution
- Simpler codebase to maintain

---

**This plan eliminates the JWT_SECRET issue permanently and simplifies the entire authentication system!** 🚀🔒
