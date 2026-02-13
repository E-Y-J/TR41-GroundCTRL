# Beta User Restriction System

## Overview
This document describes the beta user restriction system implemented in GroundCTRL. Beta users have limited access to the platform while their full access is being reviewed.

## Implementation Details

### 1. ProtectedRoute Component
**Location:** `frontend/src/components/ProtectedRoute.jsx`

A route guard component that:
- Blocks unauthenticated users (redirects to home/login)
- Blocks beta users from accessing full app features (redirects to `/beta-welcome`)
- Allows full access for users with non-beta roles

```javascript
// Usage in App.jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

### 2. Route Protection
**Location:** `frontend/src/App.jsx`

**Protected Routes (Require full user access):**
- Dashboard
- Simulator
- Missions
- Account
- Settings
- Help
- Leaderboard
- Satellites
- Ground Stations
- Community
- News
- Resources
- Tutorials
- Achievements
- Certificates
- History
- Replay
- Analytics
- Profile
- Support

**Public Routes (Accessible to everyone including beta users):**
- Home (`/`)
- Contact (`/contact`)
- Privacy (`/privacy`)
- Terms (`/terms`)
- Beta Welcome (`/beta-welcome`)

### 3. Navigation System
**Location:** `frontend/src/components/app-header.jsx`

The navigation header dynamically displays links based on user role:

**Beta Users See:**
- Beta Program
- Contact
- Privacy
- Terms

**Full Users See:**
- Dashboard
- Missions
- Simulator
- Leaderboard
- Help
- Admin (if applicable)

### 4. Dropdown Menu Restrictions
**Location:** `frontend/src/components/app-header.jsx`

Beta users have a simplified dropdown menu:
- **Visible:** User info, Sign Out
- **Hidden:** Account, Profile, Achievements, History, Analytics, Settings

Full users see all dropdown options.

### 5. Login/Signup Redirects
**Location:** `frontend/src/pages/Index.jsx`, `frontend/src/hooks/use-auth.jsx`

After successful authentication:
- **Beta users** → Redirected to `/beta-welcome`
- **Full users** → Redirected to `/dashboard`

### 6. Beta Welcome Page
**Location:** `frontend/src/pages/BetaWelcome.jsx`

An informative page for beta users that includes:
- Welcome message
- Beta access pending status
- Release timeline (Phase 1, 2, 3)
- What to expect when approved
- Contact information

## User Role Detection

The system uses the `role` field from the user object:

```javascript
// In useAuth hook
const { user } = useAuth()

// Beta user check
if (user.role === "beta") {
  // Limited access
}
```

## Backend Role Assignment

Beta users are assigned the role "beta" during signup in the backend:

**Backend Location:** `backend/src/controllers/authController.js`

When registering through the beta signup form, users are automatically assigned:
```javascript
role: "beta"
```

## Testing the System

### As a Beta User:
1. Sign up through the beta signup form
2. After login, you'll be redirected to `/beta-welcome`
3. Navigation shows: Beta Program, Contact, Privacy, Terms
4. Attempting to access protected routes redirects back to `/beta-welcome`
5. Dropdown menu shows minimal options

### As a Full User:
1. Admin upgrades user role from "beta" to "user" (or other role)
2. After login, user is redirected to `/dashboard`
3. Navigation shows full app navigation
4. All routes are accessible
5. Dropdown menu shows all options

## Upgrading Beta Users

To upgrade a beta user to full access:

1. **Via Firestore Console:**
   - Navigate to Firestore
   - Find the user document in `users` collection
   - Change `role` field from `"beta"` to `"user"`
   - User will have full access on next login

2. **Via Backend API (Future):**
   - Implement admin endpoint to update user roles
   - Admin can promote beta users through UI

## Key Files Modified

1. `frontend/src/components/ProtectedRoute.jsx` - New file
2. `frontend/src/App.jsx` - Wrapped protected routes
3. `frontend/src/components/app-header.jsx` - Dynamic navigation
4. `frontend/src/pages/BetaWelcome.jsx` - Enhanced content
5. `frontend/src/hooks/use-auth.jsx` - Added Firestore fallback for role fetching
6. `frontend/src/pages/Index.jsx` - Already had redirect logic

### Important: Backend Failure Handling

The `use-auth.jsx` hook now includes a **Firestore fallback** mechanism:

1. **Primary:** Tries to fetch user role from backend API
2. **Fallback:** If backend fails, fetches user profile directly from Firestore
3. **Last Resort:** If both fail, defaults to basic user role

This ensures beta users maintain their restricted access even when the backend is unavailable.

```javascript
// In use-auth.jsx
try {
  // Try backend first
  const backendResponse = await loginWithFirebaseToken(firebaseIdToken)
  // Use backend data...
} catch (e) {
  // Backend failed - use Firestore fallback
  const firestoreProfile = await fetchUserProfile(firebaseUser.uid)
  // Use Firestore data including role field
}
```

## Security Considerations

- ✅ Route-level protection prevents unauthorized access
- ✅ UI elements hidden for beta users (navigation, dropdown)
- ✅ Backend validates user roles on API requests
- ✅ Redirects happen automatically
- ✅ Beta users cannot access protected pages even with direct URLs

## Future Enhancements

1. **Admin Dashboard for User Management:**
   - View all beta users
   - Bulk promote beta users
   - Send approval emails

2. **Beta User Analytics:**
   - Track beta user engagement
   - Monitor when they attempt to access restricted features

3. **Automated Approval Process:**
   - Time-based approval (e.g., after X days)
   - Activity-based approval

4. **Beta User Feedback System:**
   - Allow beta users to submit feedback
   - Track feature requests

## Support

For questions or issues with the beta restriction system, contact the development team.
