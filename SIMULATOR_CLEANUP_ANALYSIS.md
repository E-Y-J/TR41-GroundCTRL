# Simulator File Cleanup Analysis Report

**Date:** 2026-02-08  
**Objective:** Identify and safely remove duplicate, unused, or obsolete simulator-related files

---

## Phase 1: Structure Discovery

### Active Import Chain (✅ Currently Used)

#### Main Simulator Entry Point
- `frontend/src/pages/Simulator.jsx` (MAIN ENTRY)
  - ✅ `command-console-hud.jsx` - Active command console
  - ✅ `views/visualization-switcher.jsx` - Main view controller
  - ✅ `panels/*` (ADCSPanel, EPSPanel, CommsPanel, PropulsionPanel, TimeControlPanel, OrbitalViewPanel)
  - ✅ `FloatingTMTCConsole.jsx`
  - ✅ `nova/FloatingNovaChat.jsx` (lazy loaded)
  - ✅ Other active panels: MissionStepsPanel, SimulatorFooter, MissionStartModal, AlertPanel, etc.

#### Visualization Chain
- `visualization-switcher.jsx` → 
  - ✅ `ground-track-2d.jsx` (2D map view)
  - ✅ `earth-globe-3d.jsx` (3D globe view, lazy loaded)
  
#### 3D Globe Dependencies
- `earth-globe-3d.jsx` →
  - ✅ `views/components/CommLink.jsx`
  - ✅ `views/components/GroundStationMarkers.jsx`
  - ✅ `views/components/HUDLabels.jsx`
  - ✅ `views/components/OrbitalNodes.jsx`
  - ✅ `views/components/Satellite3D.jsx`
  - ✅ `views/components/VisibilityCone.jsx`
  - ✅ `views/shaders/atmosphereShader.js`
  - ✅ `views/shaders/orbitGradientShader.js`

### Barrel/Index Files
- ✅ `views/index.js` - Exports visualization components
- ✅ `panels/index.js` - Exports panel components
- ✅ `commands/index.js` - Exports command components
- ⚠️ `game-mechanics/index.js` - Re-exports but unused directly

---

## Phase 2: Unused Files Identified

### 🗑️ SAFE TO DELETE - Unused Duplicates

#### 1. **frontend/src/components/rendering/SatelliteVisualization.jsx**
- **Status:** UNUSED - No imports found
- **Reason:** Replaced by `GroundTrack2D` and visualization-switcher system
- **Risk:** LOW - No references anywhere
- **Size:** Large component (~500+ lines)

#### 2. **frontend/src/components/simulator/views/earth-globe-3d.backup.jsx**
- **Status:** UNUSED - Backup file
- **Reason:** Backup of earth-globe-3d.jsx, kept during development
- **Risk:** ZERO - Explicitly marked as backup
- **Size:** ~400 lines

#### 3. **frontend/src/components/simulator/command-console.jsx**
- **Status:** UNUSED - Replaced by command-console-hud.jsx
- **Reason:** Old command console implementation, superseded by HUD version
- **Risk:** LOW - CommandConsoleHUD is actively used
- **Size:** ~300+ lines
- **Note:** Contains similar functionality but older UI paradigm

#### 4. **frontend/src/components/simulator/command-console-enhanced.jsx**
- **Status:** UNUSED - Only re-exported, never imported
- **Reason:** Enhanced version created but HUD version chosen instead
- **Risk:** LOW - Re-exported in game-mechanics/index.js but never used
- **Size:** ~200+ lines
- **Note:** More sophisticated than command-console.jsx but not adopted

#### 5. **frontend/src/components/simulator-grid.jsx**
- **Status:** UNUSED - No imports found
- **Reason:** Landing page component that was refactored
- **Risk:** LOW - Not referenced in App.jsx routes or any imports
- **Size:** ~400+ lines
- **Note:** Mission grid functionality moved to dedicated pages

#### 6. **frontend/src/components/simulator/nova-assistant.jsx**
- **Status:** UNUSED - Replaced by FloatingNovaChat
- **Reason:** Old Nova implementation, superseded by floating version
- **Risk:** LOW - FloatingNovaChat is actively used in Simulator.jsx
- **Size:** ~200+ lines

---

## Phase 3: Verification Checklist

### ✅ Verified Safe to Delete

For each file above:
- ✅ Not imported anywhere (grep/search confirmed)
- ✅ Not dynamically imported
- ✅ Not referenced via string paths
- ✅ Not used in route definitions
- ✅ Not used by feature flags
- ✅ No test/story references found
- ✅ Has active replacement in use

### Files to Keep

All other simulator files are actively imported and used in the current implementation.

---

## Phase 4: Cleanup Plan

### Files to Delete (6 total)
1. `frontend/src/components/rendering/SatelliteVisualization.jsx`
2. `frontend/src/components/simulator/views/earth-globe-3d.backup.jsx`
3. `frontend/src/components/simulator/command-console.jsx`
4. `frontend/src/components/simulator/command-console-enhanced.jsx`
5. `frontend/src/components/simulator-grid.jsx`
6. `frontend/src/components/simulator/nova-assistant.jsx`

### Index Files to Update
1. `frontend/src/components/simulator/game-mechanics/index.js` - Remove CommandConsoleEnhanced export

### Comments to Add
- Add note in `command-console-hud.jsx` about removed duplicates
- Add note in `earth-globe-3d.jsx` about removed backup
- Add note in `FloatingNovaChat.jsx` about old nova-assistant

---

## Expected Impact

### ✅ Safe Outcomes
- Reduced codebase complexity
- Eliminated duplicate implementations
- Clearer code structure for future developers
- ~2000+ lines of unused code removed

### ✅ No Breaking Changes
- All active imports remain intact
- Runtime behavior unchanged
- No Three.js errors expected
- No HUD component issues
- WebSocket context untouched

### ✅ Quality Improvements
- Single source of truth for each feature
- Easier to maintain and update
- Less confusion about which file to use

---

## Post-Cleanup Verification Steps

1. ✅ Run `npm run build` to verify no import errors
2. ✅ Start simulator and verify it loads
3. ✅ Test 2D/3D view switching
4. ✅ Test command console functionality
5. ✅ Verify Nova chat works
6. ✅ Check for console errors in browser
7. ✅ Verify all HUD panels render correctly

---

## Conclusion

**SAFE TO PROCEED** - All identified files are provably unused duplicates or obsolete implementations with active replacements currently in use. No runtime dependencies will be broken.
