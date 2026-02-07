# Tutorial System Implementation

## Overview
Complete backend implementation of the tutorial system for GroundCTRL. Tutorials are now managed via API endpoints and snapshotted onto sessions, replacing the previous static frontend configuration.

## Branch
`tutorial_addition`

## Implementation Date
February 7, 2026

---

## What Was Implemented

### 1. **Tutorial Schema** (`backend/src/schemas/tutorialSchemas.js`)
- Full Zod validation schemas for tutorial CRUD operations
- Tutorial structure includes:
  - Basic info: `code`, `title`, `description`, `scenario_id`
  - Display config: `icon`, `estimatedDurationMinutes`, `priority`
  - Trigger config: `triggerType` (ON_SCENARIO_START, ON_PANEL_OPEN, ON_COMMAND, MANUAL)
  - Tutorial steps with order, content, target elements, placement
  - Status management: DRAFT, PUBLISHED, ARCHIVED
- Schemas for create, update, patch, and list operations

### 2. **Tutorial Repository** (`backend/src/repositories/tutorialRepository.js`)
- Standard CRUD operations following project patterns
- Special method: `getByScenarioId()` - fetches all tutorials for a scenario
- Supports filtering by:
  - scenario_id
  - status (DRAFT, PUBLISHED, ARCHIVED)
  - isActive
  - triggerType
- Pagination and sorting capabilities
- Ownership scoping support

### 3. **Tutorial Controller** (`backend/src/controllers/tutorialController.js`)
- Uses crudFactory pattern for consistency
- Lifecycle hooks for logging and validation
- Custom handler: `getTutorialsByScenario(req, res, next)`
- Ownership scoping: non-admins only see their own tutorials
- Audit logging for all operations

### 4. **Tutorial Routes** (`backend/src/routes/tutorials.js`)
- `GET /api/v1/tutorials` - List all tutorials (paginated)
- `GET /api/v1/tutorials/:id` - Get single tutorial
- `GET /api/v1/tutorials/scenario/:scenarioId` - Get tutorials for scenario
- `POST /api/v1/tutorials` - Create new tutorial
- `PUT /api/v1/tutorials/:id` - Full update
- `PATCH /api/v1/tutorials/:id` - Partial update
- `DELETE /api/v1/tutorials/:id` - Delete tutorial
- Uses `optionalAuth` for read operations (public access)
- Requires `authMiddleware` for write operations

### 5. **Session Schema Updates** (`backend/src/schemas/scenarioSessionSchemas.js`)
- Added `tutorialsSnapshot` field to session schema
- Captures complete tutorial definitions at session start
- Ensures tutorial consistency throughout session lifecycle
- Preserves tutorial state even if tutorials are modified later

### 6. **Session Controller Updates** (`backend/src/controllers/scenarioSessionController.js`)
- Modified `beforeCreate` hook to snapshot tutorials
- Fetches all PUBLISHED, active tutorials for scenario
- Stores simplified tutorial data in session document
- Non-blocking: continues if tutorial fetch fails
- Logs tutorial count for debugging

### 7. **Route Registration** (`backend/src/routes/index.js`)
- Added tutorial routes to main API router
- Registered as: `router.use("/tutorials", authMiddleware, tutorialRoutes)`
- Added to available routes documentation in root endpoint

### 8. **Tutorial Seeder** (`backend/seeders/seedTutorials.js`)
- Seeds 5 sample tutorials based on frontend config:
  1. **RENDERING_2D_INTRO** - 2D Satellite View Tutorial
  2. **RENDERING_3D_INTRO** - 3D Globe View Tutorial
  3. **MISSION_CONTROL_INTRO** - Mission Control Operations
  4. **POWER_MANAGEMENT_BASICS** - Power Management Tutorial
  5. **ATTITUDE_CONTROL_INTRO** - Attitude Control Tutorial
- Accepts scenario ID as command line argument
- Prevents duplicate tutorial creation
- Comprehensive logging with emoji indicators

---

## Database Schema

### Tutorials Collection
```javascript
{
  id: "auto-generated",
  code: "POWER_MANAGEMENT_INTRO",
  title: "Power Management Tutorial",
  description: "Learn to monitor and manage satellite power systems",
  scenario_id: "scen_123",
  icon: "🔋",
  estimatedDurationMinutes: 5,
  triggerType: "ON_PANEL_OPEN",
  triggerConditions: {
    panelId: "power-panel"
  },
  steps: [
    {
      order: 0,
      title: "Power Systems Overview",
      content: "Satellite power management is critical...",
      targetElement: "#power-panel",
      placement: "right",
      isOptional: false,
      completionCriteria: {
        type: "click",
        value: "#next-button",
        timeout: 30
      }
    }
  ],
  status: "PUBLISHED",
  isActive: true,
  priority: 70,
  tags: ["power", "subsystems", "intermediate"],
  prerequisites: [],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user_id",
  createdByCallSign: "CALLSIGN"
}
```

### Session Schema Addition
```javascript
{
  // ... existing session fields ...
  tutorialsSnapshot: [
    {
      id: "tutorial_id",
      code: "POWER_MANAGEMENT_INTRO",
      title: "Power Management Tutorial",
      description: "...",
      icon: "🔋",
      estimatedDurationMinutes: 5,
      triggerType: "ON_PANEL_OPEN",
      triggerConditions: {},
      steps: [...],
      priority: 70,
      tags: [...]
    }
  ]
}
```

---

## API Endpoints

### List Tutorials
```http
GET /api/v1/tutorials?page=1&limit=20&scenario_id=scen_123&status=PUBLISHED
```

### Get Tutorial by ID
```http
GET /api/v1/tutorials/:id
```

### Get Tutorials for Scenario
```http
GET /api/v1/tutorials/scenario/:scenarioId?isActive=true&status=PUBLISHED
```

### Create Tutorial
```http
POST /api/v1/tutorials
Content-Type: application/json

{
  "code": "POWER_MANAGEMENT_INTRO",
  "title": "Power Management Tutorial",
  "description": "Learn to monitor and manage satellite power systems",
  "scenario_id": "scen_123",
  "icon": "🔋",
  "estimatedDurationMinutes": 5,
  "triggerType": "ON_PANEL_OPEN",
  "triggerConditions": {
    "panelId": "power-panel"
  },
  "steps": [...],
  "status": "DRAFT",
  "isActive": true,
  "priority": 50
}
```

### Update Tutorial
```http
PUT /api/v1/tutorials/:id
PATCH /api/v1/tutorials/:id
```

### Delete Tutorial
```http
DELETE /api/v1/tutorials/:id
```

---

## Frontend Integration

### Current Frontend Usage
The frontend currently uses static tutorial configuration in:
- `frontend/src/config/tutorials.js`
- `frontend/src/lib/tutorial-data.js`
- `frontend/src/contexts/TutorialContext.jsx`

### Migration Path
1. **Phase 1 (Current)**: Backend API is ready, frontend still uses static config
2. **Phase 2**: Update frontend to fetch tutorials from API:
   ```javascript
   // In TutorialContext or tutorial service
   const fetchTutorials = async (scenarioId) => {
     const response = await fetch(`/api/v1/tutorials/scenario/${scenarioId}`);
     const data = await response.json();
     return data.payload.data.tutorials;
   };
   ```
3. **Phase 3**: Update tutorial progress tracking to use session snapshots
4. **Phase 4**: Remove static tutorial configuration files

---

## Usage Examples

### Seeding Tutorials
```bash
# Seed with specific scenario ID
node backend/seeders/seedTutorials.js scen_abc123

# Seed with placeholder (requires manual update)
node backend/seeders/seedTutorials.js
```

### Fetching Tutorials in Code
```javascript
const tutorialRepository = require('./repositories/tutorialRepository');

// Get all tutorials for a scenario
const tutorials = await tutorialRepository.getByScenarioId('scen_123', {
  isActive: true,
  status: 'PUBLISHED'
});

// Get single tutorial
const tutorial = await tutorialRepository.getById('tutorial_id');

// Create tutorial
const newTutorial = await tutorialRepository.create({
  code: 'MY_TUTORIAL',
  title: 'My Tutorial',
  // ... other fields
}, {
  createdBy: userId,
  createdByCallSign: callSign
});
```

---

## Testing

### Manual Testing Steps
1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Seed tutorial data**
   ```bash
   node seeders/seedTutorials.js <scenario_id>
   ```

3. **Test API endpoints**
   ```bash
   # List tutorials
   curl http://localhost:5000/api/v1/tutorials
   
   # Get tutorials for scenario
   curl http://localhost:5000/api/v1/tutorials/scenario/scen_123
   ```

4. **Create a session and verify snapshot**
   - Create a session for a scenario with tutorials
   - Check that `tutorialsSnapshot` field is populated
   - Verify tutorial data is captured correctly

### Automated Testing (Future)
- Unit tests for tutorial repository
- Integration tests for tutorial endpoints
- Session creation tests with tutorial snapshots
- Tutorial seeder tests

---

## Files Created/Modified

### New Files
- `backend/src/schemas/tutorialSchemas.js` - Tutorial validation schemas
- `backend/src/repositories/tutorialRepository.js` - Tutorial data access
- `backend/src/controllers/tutorialController.js` - Tutorial business logic
- `backend/src/routes/tutorials.js` - Tutorial API routes
- `backend/seeders/seedTutorials.js` - Tutorial data seeder

### Modified Files
- `backend/src/routes/index.js` - Registered tutorial routes
- `backend/src/schemas/scenarioSessionSchemas.js` - Added tutorialsSnapshot
- `backend/src/controllers/scenarioSessionController.js` - Added tutorial snapshotting

---

## Benefits

1. **Centralized Management**: Tutorials managed via database instead of code
2. **Dynamic Updates**: Change tutorials without frontend deployment
3. **Version Control**: Sessions preserve tutorial state at creation time
4. **Scalability**: Easy to add/modify tutorials through API
5. **Consistency**: Uses same patterns as other resources (scenarios, steps)
6. **Ownership**: Tutorial ownership and permissions built-in
7. **Audit Trail**: All tutorial changes logged
8. **Flexibility**: Support multiple trigger types and conditions

---

## Next Steps

1. **Update Frontend**: Migrate from static config to API calls
2. **Add Indexes**: Create Firestore indexes for tutorial queries
3. **Testing**: Add comprehensive test coverage
4. **Documentation**: Create API documentation with examples
5. **Admin UI**: Build tutorial management interface
6. **Analytics**: Track tutorial completion and effectiveness
7. **A/B Testing**: Support multiple tutorial variations

---

## Notes

- Tutorials are attached to specific scenarios via `scenario_id`
- When a session starts, all active, published tutorials are snapshotted
- Tutorial snapshots ensure consistency throughout session lifecycle
- Frontend can continue using existing tutorial system while migration happens
- Tutorial progress tracking remains in frontend `TutorialContext`
- User tutorial preferences stored in Firestore `users/{uid}/preferences/tutorials`

---

## Related Documentation

- Frontend Tutorial Implementation: `frontend/src/contexts/TutorialContext.jsx`
- Tutorial Schema Types: `frontend/src/lib/schemas/tutorial-schema.js`
- Session Schema: `backend/src/schemas/scenarioSessionSchemas.js`
- Scenario Schema: `backend/src/schemas/scenarioSchemas.js`

---

## Support

For questions or issues with the tutorial system:
1. Check this documentation
2. Review tutorial seeder for examples
3. Examine existing tutorial routes and controllers
4. Test with Postman collection (create one if needed)

---

**Implementation Status**: ✅ Complete
**Branch**: `tutorial_addition`
**Ready for**: Frontend Integration & Testing
