# Leaderboard Seed Data 🏆

## Overview

The leaderboard seeder populates the database with realistic completed scenario sessions to display operator rankings. This creates a compelling demo environment showing competitive performance metrics.

## What Gets Seeded

### Scenario Sessions (68 total)
Completed mission data across 8 different scenarios with varying difficulty levels:

- **ROOKIE_COMMISSIONING_101**: 15 operators (98% to 45% scores)
- **ROOKIE_ORBIT_101**: 12 operators (97% to 52% scores)
- **ROOKIE_POWER_101**: 10 operators (96% to 55% scores)
- **SPECIALIST_GROUND_STATION_201**: 8 operators (95% to 63% scores)
- **SPECIALIST_MANEUVER_201**: 7 operators (94% to 64% scores)
- **COMMANDER_EMERGENCY_301**: 5 operators (92% to 70% scores)
- **COMMANDER_FULL_MISSION_301**: 3 operators (90% to 78% scores)
- **DEMO_COMPLETE_HUD**: 8 operators (93% to 52% scores)

### Operators (15 total)
NASA-themed call signs with realistic performance profiles:
- APOLLO (top performer - 90-98% scores)
- MERCURY (consistent high scores - 84-95%)
- GEMINI (strong performer - 78-92%)
- VOYAGER, PIONEER, MARINER (mid-tier)
- VIKING, CASSINI, GALILEO (intermediate)
- JUNO, KEPLER, HUBBLE (learning operators)
- SPITZER, CHANDRA, PHOENIX (beginners)

## Data Structure

Each scenario session includes:
```javascript
{
  scenarioId: "firestore_doc_id",
  userId: "user_001",
  userCallSign: "APOLLO",
  status: "completed",
  startTime: "2026-02-07T10:30:00Z",
  endTime: "2026-02-07T10:48:00Z",
  performance: {
    overallScore: 98,
    duration: "18m",
    scores: {
      commandAccuracy: 98,
      responseTime: 93,
      resourceManagement: 100,
      completionTime: 95,
      errorAvoidance: 103
    },
    breakdown: {
      coverage: 98,
      efficiency: 93,
      accuracy: 101
    },
    missionsCompleted: 1,
    hintsUsed: 0,
    errorsEncountered: 0
  },
  completedAt: "2026-02-07T10:48:00Z",
  version: 1
}
```

## Usage

**Important**: Run these commands from the `backend/seeders` directory:

### Seed Everything (including leaderboard)
```bash
cd backend/seeders
node seed.js
```

### Seed Only Leaderboard
```bash
cd backend/seeders
node seed.js --leaderboard
```

### Seed Multiple Components
```bash
cd backend/seeders
node seed.js --scenarios --leaderboard
```

## Time Distribution

Sessions are distributed across the last 50 days to show:
- Recent activity (last 7 days)
- Weekly trends (last 30 days)
- Monthly performance (all-time)

This supports the leaderboard's time period filters:
- `today`
- `week`
- `month`
- `all-time`

## Performance Characteristics

### Score Distribution
- **Elite (90-100%)**: 3 operators - Top commanders
- **Excellent (80-89%)**: 4 operators - Skilled specialists
- **Good (70-79%)**: 3 operators - Competent operators
- **Fair (60-69%)**: 3 operators - Developing skills
- **Learning (45-59%)**: 2 operators - Beginners

### Realistic Metrics
- Completion times vary by scenario difficulty
- Hints usage increases for lower scores
- Errors correlate with difficulty and operator skill
- Advanced scenarios have fewer completions (only skilled operators)

## Frontend Integration

The seeded data populates the leaderboard endpoints:

### Global Leaderboard
```
GET /api/leaderboard/global?period=all-time&limit=100
```

### Scenario-Specific Leaderboard
```
GET /api/leaderboard/scenario/{scenarioId}?limit=100
```

### User Rank
```
GET /api/leaderboard/user/rank
```

## Files

- `data/scenarioSessions.js` - Seed data (68 sessions)
- `seedLeaderboard.js` - Seeder script
- `seed.js` - Main seeder (updated)

## Dependencies

Requires scenarios to be seeded first (automatic dependency resolution):
```bash
node seed.js --scenarios --leaderboard
```

Or let the seeder fetch existing scenarios:
```bash
node seed.js --leaderboard
# Will auto-fetch scenarios from Firestore
```

## Testing

After seeding, verify the leaderboard:

1. **Check session count**:
   ```javascript
   db.collection('scenarioSessions').where('status', '==', 'completed').get()
   // Should return 68 documents
   ```

2. **Test API endpoints**:
   ```bash
   curl http://localhost:3000/api/leaderboard/global?period=all-time
   ```

3. **Verify rankings**:
   - APOLLO should be #1 (highest average score)
   - PHOENIX should be lowest (beginner scores)
   - Score distribution should be realistic

## Notes

- Uses realistic NASA mission call signs
- Performance metrics match the scoring engine logic
- Dates are spread across 50 days for time-based queries
- All sessions are marked as "completed" status
- Supports all leaderboard repository queries
- Compatible with existing frontend leaderboard components

## Future Enhancements

Potential improvements:
- Add more operator diversity (100+ operators)
- Include in-progress sessions
- Add seasonal performance variations
- Include achievement data
- Add certification/rank progression
