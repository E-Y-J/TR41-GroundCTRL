# Beta Program Implementation Summary

## Overview
Implemented a low-friction beta signup system that replaces traditional registration/login on the Home page. Beta users are assigned a `role: "beta"` and are restricted from accessing the main application until their access is approved.

## Implementation Date
February 10, 2026

## Key Features

### 1. Beta Signup Form
**Location:** `frontend/src/components/beta-signup-form.jsx`

- **Minimal Fields (2-4 max):**
  - Email (required)
  - Password (required, min 8 characters)
  - First Name or Handle (optional)
  - Primary Role dropdown (optional): Student, Hobbyist, Engineer, Mission Ops, Educator, Researcher, Other

- **Checkboxes:**
  - Terms & Privacy Policy agreement (required)
  - Optional updates subscription

- **User Experience:**
  - Clean, conversion-optimized design
  - Clear CTA: "Request Beta Access"
  - Space-themed with rocket icon
  - Benefit-oriented messaging

### 2. Beta Welcome Page
**Location:** `frontend/src/pages/BetaWelcome.jsx`

- Congratulatory message for beta applicants
- Status indicator showing "Beta Access Pending"
- Clear explanation of next steps:
  - Review process (2-3 business days)
  - Email notification when approved
  - Full access upon approval
- Link to help documentation
- Sign out option

### 3. Backend Changes

#### Database Schema (`backend/src/services/authService.js`)
Added metadata support to user registration:
```javascript
{
  role: "beta" | "user" | "admin",  // Default: "user"
  primaryRole: string,               // Student, Engineer, etc.
  onboardingComplete: boolean,       // Default: false
  wantsUpdates: boolean             // Email subscription preference
}
```

#### Controller Updates (`backend/src/controllers/authController.js`)
- Modified `/auth/register` to accept optional beta metadata fields
- Passes metadata to auth service for user creation

#### Schema Validation (`backend/src/schemas/authSchemas.js`)
Added optional fields to `registerSchema`:
- `role`: enum ["beta", "user", "admin"]
- `primaryRole`: string (max 50 characters)
- `onboardingComplete`: boolean
- `wantsUpdates`: boolean

### 4. Frontend Auth Flow

#### Home Page (`frontend/src/pages/Index.jsx`)
- Replaced `AuthForm` with `BetaSignupForm`
- Auto-redirects logged-in users:
  - Beta users → `/beta-welcome`
  - Regular users → `/dashboard`
- Removed registration/login forms from sidebar

#### Navigation (`frontend/src/components/app-header.jsx`)
- **Hidden for non-logged-in users:**
  - Dashboard, Missions, Simulator, Help navigation links
  - Tutorial toggle button
- **Visible for all:**
  - Logo
  - Theme toggle
  - Account dropdown (shows sign-in options when logged out)

#### Auth Hook (`frontend/src/hooks/use-auth.jsx`)
- Added `role` field to user object
- Updated signUp to accept metadata parameter
- Role is fetched from backend and included in user state

#### Firebase Auth (`frontend/src/lib/firebase/auth.js`)
- Updated `signUp` function to accept and pass metadata to backend
- Metadata includes: role, primaryRole, onboardingComplete, wantsUpdates

### 5. Protected Route Guards

#### Dashboard (`frontend/src/pages/Dashboard.jsx`)
```javascript
useEffect(() => {
  if (!loading && !user) {
    navigate("/")
  } else if (user && user.role === "beta") {
    navigate("/beta-welcome")
  }
}, [user, loading, navigate])
```

#### Simulator (`frontend/src/pages/Simulator.jsx`)
```javascript
useEffect(() => {
  if (!authLoading && !user) {
    navigate("/?error=auth_required")
  } else if (user && user.role === "beta") {
    navigate("/beta-welcome")
  }
}, [user, authLoading, navigate])
```

#### Missions Page
- Remains publicly accessible for browsing
- Beta users can view missions but cannot start them (handled by protected routes)

## User Flow

### New Beta Signups
1. User visits Home page
2. Sees hero content + beta signup form
3. Fills out minimal information (email, password, optional name/role)
4. Submits form
5. Account created with `role: "beta"` in Firestore
6. Auto-redirected to `/beta-welcome`
7. Sees pending status message

### Beta User Experience
- Can sign in but immediately redirected to `/beta-welcome`
- Cannot access Dashboard, Simulator, or start missions
- Can view Help documentation
- Can sign out

### Upgrading Beta Users
To approve a beta user, update their Firestore document:
```javascript
await db.collection('users').doc(userId).update({
  role: 'user'
})
```
Next login, they'll have full access.

## Technical Details

### Role-Based Access Control
- **`role: "beta"`** - Limited access, pending approval
- **`role: "user"`** - Full access to all features
- **`role: "admin"`** - Full access + admin panels

### Data Flow
1. Frontend: Beta signup form collects minimal data
2. Backend: `/auth/register` endpoint creates Firebase Auth user + Firestore document
3. Firestore: User document includes `role`, `primaryRole`, `onboardingComplete`, `wantsUpdates`
4. Frontend: Auth hook fetches user profile including role
5. Frontend: Route guards check `user.role` and redirect accordingly

### Security Considerations
- Password requirements maintained (8+ characters for beta, 12+ for full system)
- Firebase Auth handles authentication
- Backend validates all input through Zod schemas
- Role stored in Firestore (backend-controlled, not client-controlled)
- JWT tokens don't include role (fetched from Firestore on each request)

## Future Enhancements

### Post-Login Onboarding (Not Yet Implemented)
When beta users are approved and upgraded to `user` role:
1. Detect `onboardingComplete === false` on first real login
2. Show onboarding wizard with:
   - Experience level with space/satellite ops
   - Primary use case (education, research, training)
   - Organization/affiliation
   - Timezone and preferred units
   - Notification preferences
   - Mission templates of interest
3. Update `onboardingComplete: true` when finished
4. Redirect to first mission

### Admin Panel for Beta Management (Not Yet Implemented)
- List all beta applicants
- View application details
- One-click approval (updates `role` to `user`)
- Send approval emails
- Bulk operations

### Email Notifications (Not Yet Implemented)
- Welcome email on beta signup
- Approval notification email
- Optional product updates (if `wantsUpdates: true`)

## Files Modified

### Frontend
- `frontend/src/components/beta-signup-form.jsx` (new)
- `frontend/src/pages/BetaWelcome.jsx` (new)
- `frontend/src/pages/Index.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/app-header.jsx`
- `frontend/src/hooks/use-auth.jsx`
- `frontend/src/lib/firebase/auth.js`
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Simulator.jsx`

### Backend
- `backend/src/services/authService.js`
- `backend/src/controllers/authController.js`
- `backend/src/schemas/authSchemas.js`

## Testing Checklist

- [ ] Beta signup creates user with `role: "beta"`
- [ ] Beta users redirected to `/beta-welcome` on login
- [ ] Beta users cannot access Dashboard
- [ ] Beta users cannot access Simulator
- [ ] Beta users can view Help documentation
- [ ] Nav links hidden for non-logged-in users
- [ ] Tutorial button hidden for non-logged-in users
- [ ] Upgrading beta user to `user` role grants full access
- [ ] Footer links work for all users
- [ ] Theme toggle works for all users
- [ ] Account dropdown shows sign-in options when logged out

## Notes

- Beta signup uses simpler password requirements (8 characters) vs full system (12 characters with complexity)
- This can be adjusted by modifying the validation in `beta-signup-form.jsx`
- Backend still enforces 12-character requirement, so frontend should match
- Consider lowering backend requirements for beta or handling validation differently

## Maintenance

### To Approve Beta Users
```javascript
// In Firebase Console or admin script
const admin = require('firebase-admin');
const db = admin.firestore();

await db.collection('users').doc(USER_ID).update({
  role: 'user'
});
```

### To Query Beta Applicants
```javascript
const betaUsers = await db.collection('users')
  .where('role', '==', 'beta')
  .get();

betaUsers.forEach(doc => {
  console.log(doc.id, doc.data().email);
});
```
