# HUD Enhancement - Phase 1 Implementation
## Foundation & Modular Panels

**Date:** February 7, 2026  
**Status:** ✅ COMPLETED  
**Phase:** 1 of 7 (Foundation)

---

## Overview

Phase 1 establishes the foundation for the realistic mission control HUD by implementing:
- Draggable/resizable panel infrastructure
- Floating TM/TC console (YAMCS-style)
- Modular subsystem panels (ADCS, EPS, Comms, Propulsion)
- Persistent panel positions using localStorage

---

## Completed Tasks ✅

### 1. Dependencies Installation
**Status:** ✅ Completed

Installed packages:
```bash
npm install react-rnd react-window @react-three/fiber @react-three/drei @react-three/postprocessing
```

**Versions Installed:**
- `react-rnd` - For draggable/resizable components
- `react-window` - For virtual scrolling in logs (ready for future use)
- `@react-three/fiber` - React renderer for Three.js (ready for Phase 3)
- `@react-three/drei` - R3F helpers (ready for Phase 3)
- `@react-three/postprocessing` - Post-processing effects (ready for Phase 3)

### 2. Core Components Created

#### DraggablePanel Component
**File:** `frontend/src/components/simulator/DraggablePanel.jsx`

**Features:**
- ✅ Draggable via react-rnd
- ✅ Resizable with min/max constraints
- ✅ Minimize/maximize functionality
- ✅ Close button support
- ✅ Position persistence to localStorage (per panel ID)
- ✅ Customizable drag handle
- ✅ Styled with Tailwind CSS

**Usage:**
```javascript
<DraggablePanel
  id="my-panel"
  title="Panel Title"
  defaultPosition={{ x: 100, y: 100, width: 400, height: 300 }}
  minWidth={300}
  minHeight={200}
  onClose={handleClose}
>
  {children}
</DraggablePanel>
```

#### SubsystemCard Component
**File:** `frontend/src/components/simulator/SubsystemCard.jsx`

**Features:**
- ✅ Wraps DraggablePanel with subsystem-specific styling
- ✅ Status-colored borders (nominal=green, warning=yellow, critical=red, offline=gray)
- ✅ Alarm badge display
- ✅ Status header with icon
- ✅ Reusable helper components: DataRow, StatusBar, StatusGlyph

**Helper Components:**
- `DataRow` - Key-value display with unit and status colors
- `StatusBar` - Visual progress/level indicator with percentage
- `StatusGlyph` - Colored indicator dot with optional pulse animation

#### FloatingTMTCConsole Component
**File:** `frontend/src/components/simulator/FloatingTMTCConsole.jsx`

**Features:**
- ✅ YAMCS-style telemetry and command log
- ✅ Real-time message stream (TM/TC/EVENT types)
- ✅ Search functionality
- ✅ Filter by subsystem, severity, and type
- ✅ Pause/resume auto-scroll
- ✅ Export logs to JSON
- ✅ Clear messages
- ✅ Color-coded severity (nominal=green, warning=yellow, critical=red)
- ✅ Expandable raw data view (click message to expand)
- ✅ Message limit (default 500 messages)
- ✅ Auto-scroll to newest messages

**Message Schema:**
```javascript
{
  id: string,
  timestamp: number,
  type: 'TM' | 'TC' | 'EVENT',
  subsystem: 'ADCS' | 'EPS' | 'COMMS' | 'PROP' | 'SYSTEM',
  severity: 'nominal' | 'warning' | 'critical',
  content: string,
  raw: object
}
```

### 3. Subsystem Panels Created

#### ADCS Panel (Attitude Determination & Control System)
**File:** `frontend/src/components/simulator/panels/ADCSPanel.jsx`

**Displays:**
- ✅ Attitude angles (roll, pitch, yaw)
- ✅ Angular rates (X, Y, Z axes)
- ✅ Reaction wheel speeds (4 wheels with status)
- ✅ Gyroscope status

**Default Position:** x: 50, y: 150, width: 300, height: 380

#### EPS Panel (Electrical Power System)
**File:** `frontend/src/components/simulator/panels/EPSPanel.jsx`

**Displays:**
- ✅ Battery State of Charge (SOC) with status bar
- ✅ Battery voltage, current, temperature
- ✅ Charge rate calculation
- ✅ Solar array output (4 panels with individual status)
- ✅ Power budget (generation, consumption, net)

**Default Position:** x: 360, y: 150, width: 300, height: 420

#### Comms Panel (Communications System)
**File:** `frontend/src/components/simulator/panels/CommsPanel.jsx`

**Displays:**
- ✅ Signal strength (dBm) with status indicator
- ✅ Uplink/downlink data rates
- ✅ Packet loss percentage
- ✅ Active ground station
- ✅ Next AOS (Acquisition of Signal) countdown
- ✅ Antenna tracking status

**Default Position:** x: 670, y: 150, width: 300, height: 360

#### Propulsion Panel
**File:** `frontend/src/components/simulator/panels/PropulsionPanel.jsx`

**Displays:**
- ✅ Fuel remaining with status bar
- ✅ Tank pressure and temperature
- ✅ Propellant mass
- ✅ Delta-V budget
- ✅ Thruster grid (8 thrusters with individual status)
- ✅ System ready status

**Default Position:** x: 50, y: 550, width: 300, height: 400

### 4. Panel Index Export
**File:** `frontend/src/components/simulator/panels/index.js`

Provides centralized exports:
```javascript
export { ADCSPanel } from "./ADCSPanel"
export { EPSPanel } from "./EPSPanel"
export { CommsPanel } from "./CommsPanel"
export { PropulsionPanel } from "./PropulsionPanel"
```

### 5. Simulator Integration
**File:** `frontend/src/pages/Simulator.jsx`

**Changes:**
- ✅ Imported all new panel components
- ✅ Added panel visibility state management
- ✅ Integrated FloatingTMTCConsole
- ✅ Integrated all 4 subsystem panels
- ✅ Panels only render when mission is started
- ✅ Close buttons toggle panel visibility

**Panel Visibility State:**
```javascript
const [showTMTCConsole, setShowTMTCConsole] = useState(true)
const [showADCSPanel, setShowADCSPanel] = useState(true)
const [showEPSPanel, setShowEPSPanel] = useState(true)
const [showCommsPanel, setShowCommsPanel] = useState(true)
const [showPropulsionPanel, setShowPropulsionPanel] = useState(false) // Hidden by default
```

---

## File Structure

```
frontend/src/components/simulator/
├── DraggablePanel.jsx                   # ✅ NEW - Base draggable component
├── SubsystemCard.jsx                    # ✅ NEW - Subsystem panel wrapper
├── FloatingTMTCConsole.jsx             # ✅ NEW - TM/TC log console
└── panels/                             # ✅ NEW DIRECTORY
    ├── index.js                        # ✅ NEW - Panel exports
    ├── ADCSPanel.jsx                   # ✅ NEW - Attitude control
    ├── EPSPanel.jsx                    # ✅ NEW - Electrical power
    ├── CommsPanel.jsx                  # ✅ NEW - Communications
    └── PropulsionPanel.jsx             # ✅ NEW - Propulsion
```

---

## How It Works

### Panel Persistence
Each panel saves its position to localStorage using a unique ID:
```javascript
localStorage.setItem(`panel-position-${id}`, JSON.stringify(position))
```

On component mount, the panel loads its saved position or uses the default.

### Telemetry Flow
1. Simulator receives telemetry updates via WebSocket
2. SimulatorStateContext stores telemetry in state
3. FloatingTMTCConsole subscribes to telemetry changes
4. New messages are added to the console (max 500)
5. Subsystem panels extract relevant data from telemetry object

### Panel Positioning
- Panels use `react-rnd` for drag/resize functionality
- `bounds="parent"` ensures panels stay within simulator viewport
- `dragHandleClassName="drag-handle"` allows dragging only from header
- Minimum width/height constraints prevent panels from becoming unusable

---

## Testing Checklist

### Manual Testing
- [ ] Drag panels to different positions
- [ ] Resize panels (check min/max constraints)
- [ ] Minimize/maximize panels
- [ ] Close panels and verify state updates
- [ ] Refresh page - verify panel positions persist
- [ ] Check TM/TC console receives telemetry updates
- [ ] Test search functionality in TM/TC console
- [ ] Test filter dropdowns (subsystem, type, severity)
- [ ] Pause/resume auto-scroll in TM/TC console
- [ ] Export logs to JSON
- [ ] Clear messages
- [ ] Click messages to expand raw data
- [ ] Verify all subsystem panels display data
- [ ] Check status colors (nominal=green, warning=yellow, critical=red)

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Large monitors (2560x1440+)

---

## Known Limitations

1. **Telemetry Integration:** Panels currently use fallback data if telemetry structure doesn't match. Need to verify WebSocket telemetry format aligns with panel expectations.

2. **Panel Overlap:** No z-index management yet. Last dragged panel doesn't automatically come to front.

3. **No Panel Menu:** Users cannot re-open closed panels without refreshing. Need to add a panel visibility menu (future enhancement).

4. **No Layout Presets:** No ability to save/load panel layouts (future enhancement).

5. **Limited TM/TC History:** Messages are only stored in component state. No backend historical data API yet (Phase 6).

---

## Phase 1.5: Panel Docking System (Immediate Next Step)

**Goal:** Add magnetic docking zones where draggable panels can snap into predefined areas for optimal layout management.

### Docking Zone Architecture

Based on the wireframe analysis, implement the following docking zones:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Top Dock Zone                             │
│  (Above 2D/3D View - Mission Steps, Pass Timeline, Orbit Params)│
├────────┬──────────────────────────────────────────┬─────────────┤
│        │                                          │             │
│  Left  │                                          │    Right    │
│  Dock  │         Central 2D/3D View              │    Dock     │
│  Zone  │         (No Docking Here)                │    Zone     │
│        │                                          │             │
│ (NOVA, │                                          │  (Command   │
│  ADCS, │                                          │   Console,  │
│  EPS)  │                                          │   TM/TC,    │
│        │                                          │   Comms)    │
│        │                                          │             │
├────────┴──────────────────────────────────────────┴─────────────┤
│                      Bottom Dock Zone                            │
│  (Below View - Resource Bars, Command Queue, System Status)     │
├─────────────────────────────────────────────────────────────────┤
│                        Footer Dock                               │
│  (Mission Time, Hints, Performance Metrics)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Docking Zone Specifications

#### 1. Left Column Dock (Primary: Information Panels)
**Location:** Left side of 2D/3D view  
**Width:** 300-400px  
**Optimal for:**
- NOVA AI Chat (default pinned)
- ADCS Panel (attitude monitoring)
- EPS Panel (power monitoring)
- Propulsion Panel

**Layout Strategy:**
- Vertical stacking
- Auto-resize to fit available height
- Collapsible headers to maximize space
- Maximum 3-4 panels before scrolling

#### 2. Right Column Dock (Primary: Control & Logs)
**Location:** Right side of 2D/3D view  
**Width:** 350-450px  
**Optimal for:**
- Command Console (default pinned)
- TM/TC Console (telemetry/command log)
- Comms Panel (signal strength, ground station)
- Command Queue Status

**Layout Strategy:**
- Vertical stacking
- Prioritize active command interface at top
- Scrollable log panels in lower section
- Maximum 3-4 panels before scrolling

#### 3. Top Dock Zone (Primary: Mission Status)
**Location:** Above 2D/3D view, below mission steps  
**Height:** 60-120px (auto-adjusts)  
**Optimal for:**
- Pass Contact Timeline (horizontal bar)
- Orbit Parameters (compact horizontal display)
- Mission Phase Indicators
- Alert/Alarm Banner

**Layout Strategy:**
- Horizontal layout
- Compact, info-dense display
- Auto-collapse when panels docked
- Maximum 2 rows

#### 4. Bottom Dock Zone (Primary: Resources & Queues)
**Location:** Below 2D/3D view, above footer  
**Height:** 80-150px (auto-adjusts)  
**Optimal for:**
- Resource Bars (Fuel, Battery, Solar, Thermal) - default
- Command Queue Dock (pipeline view)
- System Health Dashboard
- Quick Action Buttons

**Layout Strategy:**
- Horizontal or grid layout
- Always visible (pinned by default)
- Compact visualization
- Maximum 2 rows

#### 5. Footer Dock (Secondary: Metadata)
**Location:** Bottom of screen  
**Height:** 40-60px (fixed)  
**Optimal for:**
- Mission Elapsed Time (MET)
- Performance Metrics
- Orbit Status Badge
- Communication Link Status
- Hints Counter

**Layout Strategy:**
- Single horizontal row
- Always visible
- Compact text/badges
- No panel docking (informational only)

### Docking Behavior Implementation

#### Snap-to-Dock Logic
```javascript
// Pseudo-code for docking detection
const DOCK_ZONES = {
  left: { x: 0, y: 150, width: 400, height: 'calc(100vh - 300px)' },
  right: { x: 'calc(100vw - 400px)', y: 150, width: 400, height: 'calc(100vh - 300px)' },
  top: { x: 400, y: 80, width: 'calc(100vw - 800px)', height: 120 },
  bottom: { x: 400, y: 'calc(100vh - 200px)', width: 'calc(100vw - 800px)', height: 150 }
}

function detectDockZone(panelPosition) {
  const SNAP_THRESHOLD = 50 // pixels from zone edge
  
  for (const [zone, bounds] of Object.entries(DOCK_ZONES)) {
    if (isNearZone(panelPosition, bounds, SNAP_THRESHOLD)) {
      return zone
    }
  }
  return null
}

function snapToZone(panel, zone) {
  const dockedPanels = getDockedPanels(zone)
  const position = calculateOptimalPosition(zone, dockedPanels, panel)
  
  // Animate panel to docked position
  animatePanel(panel, position)
  
  // Mark as docked
  panel.docked = true
  panel.dockZone = zone
  
  // Adjust other panels in same zone
  rearrangeDockedPanels(zone)
}
```

#### Auto-Layout Adjustment
When a panel docks:
1. **Calculate available space** in that zone
2. **Resize existing panels** to accommodate new panel
3. **Reorder panels** by priority (user-defined or default)
4. **Animate transitions** smoothly (300ms)
5. **Save dock configuration** to localStorage

#### Undocking Behavior
When a panel is dragged away from dock zone:
1. **Detect drag distance** > 100px from zone
2. **Switch to free-floating mode**
3. **Restore original size** (pre-dock dimensions)
4. **Rearrange remaining docked panels**
5. **Update saved configuration**

### Technical Implementation

#### New Components Needed

**1. DockZone Component**
```javascript
<DockZone
  zone="left"
  maxPanels={4}
  allowedPanelTypes={['info', 'monitoring']}
  onPanelDock={handleDock}
  onPanelUndock={handleUndock}
>
  {dockedPanels.map(panel => (
    <DockedPanel key={panel.id} {...panel} />
  ))}
</DockZone>
```

**2. Update DraggablePanel**
Add docking detection:
- `onDragMove`: Check proximity to dock zones
- `onDragEnd`: Snap if within threshold
- `docked` prop: Toggle docked vs. floating state
- `dockZone` prop: Current dock location

**3. DockingManager Context**
```javascript
const DockingContext = {
  dockedPanels: {},
  dockPanel: (panelId, zone) => {},
  undockPanel: (panelId) => {},
  getDockZoneLayout: (zone) => {},
  saveDockConfig: () => {}
}
```

### User Experience Features

#### Visual Indicators
- **Dock zones highlight** when panel is dragged near (blue glow)
- **Snap preview ghost** shows where panel will land
- **Dock icon** appears in panel header when docked
- **Undock button** in panel header (drag or click to undock)

#### Keyboard Shortcuts
- `Ctrl+D`: Dock panel to suggested zone
- `Ctrl+Shift+D`: Undock panel
- `Ctrl+1-4`: Dock to specific zone (1=left, 2=right, 3=top, 4=bottom)

#### Preset Layouts
- **Mission Control Default**: Command right, NOVA left, TM/TC right-bottom
- **Engineering View**: All subsystem panels docked left, logs right
- **Compact View**: Minimal panels, maximize 3D view
- **Custom**: User-defined, saved per-user

### Configuration Storage

```javascript
// localStorage schema
{
  "dockConfig": {
    "left": [
      { "panelId": "nova-chat", "order": 0, "height": 400 },
      { "panelId": "adcs-panel", "order": 1, "height": 380 }
    ],
    "right": [
      { "panelId": "command-console", "order": 0, "height": 500 },
      { "panelId": "tmtc-console", "order": 1, "height": 400 }
    ],
    "bottom": [
      { "panelId": "command-queue", "order": 0, "height": 120 }
    ]
  },
  "floatingPanels": [
    { "panelId": "propulsion-panel", "x": 100, "y": 200, "width": 300, "height": 400 }
  ]
}
```

---

## Next Steps (Future Phases)

### Phase 2: Enhanced 3D Visualization (Week 2-3)
- Upgrade EarthGlobe3D with React Three Fiber
- Add atmosphere glow shader
- Implement orbit path ribbons
- Add HUD overlays on 3D canvas
- Create satellite 3D model

### Phase 3: Command Queue & Pass Timeline (Week 4)
- Create CommandQueueDock component (bottom-docked)
- Implement pass prediction timeline
- Add AOS/LOS markers
- Backend: Pass prediction algorithm

### Phase 4: Time Conductor (Week 5)
- Create TimeConductor component
- Implement live/fixed/replay modes
- Add timeline scrubber
- Backend: Historical telemetry storage

### Phase 5: Polish & Testing (Week 5-6)
- Performance optimization
- Accessibility improvements
- Mobile responsiveness
- Unit/integration tests
- E2E tests with Playwright

---

## Performance Considerations

### Current Performance
- Panel dragging/resizing is smooth (60 FPS target)
- Message list uses native DOM (no virtual scrolling yet)
- LocalStorage operations are minimal (only on drag/resize end)

### Optimization Opportunities
1. **Virtual Scrolling:** Implement react-window for TM/TC console message list (>1000 messages)
2. **Memoization:** Add React.memo to panel components
3. **Debounce:** Debounce localStorage saves during rapid dragging
4. **Z-Index Management:** Implement click-to-focus with z-index stacking

---

## Documentation for Developers

### Creating a New Panel

1. Create panel file in `frontend/src/components/simulator/panels/YourPanel.jsx`
2. Import SubsystemCard and helper components:
   ```javascript
   import { SubsystemCard, DataRow, StatusBar } from "../SubsystemCard"
   ```
3. Implement panel component:
   ```javascript
   export function YourPanel({ telemetry, status, onClose }) {
     return (
       <SubsystemCard
         subsystem="YOUR_SUBSYSTEM"
         title="Your Panel Title"
         icon={YourIcon}
         status={status}
         defaultPosition={{ x: 100, y: 100, width: 300, height: 300 }}
         onClose={onClose}
       >
         {/* Your content */}
       </SubsystemCard>
     )
   }
   ```
4. Export from `panels/index.js`
5. Import and integrate in `Simulator.jsx`

### Adding New TM/TC Message Types

1. Create message object with required fields:
   ```javascript
   const message = {
     id: `unique-id-${Date.now()}`,
     timestamp: Date.now(),
     type: 'TM', // or 'TC', 'EVENT'
     subsystem: 'SYSTEM',
     severity: 'nominal',
     content: 'Your message',
     raw: { /* optional data */ }
   }
   ```
2. Add to messages state in FloatingTMTCConsole

---

## References

- HUD Enhancement Plan: `HUD_ENHANCEMENT_PLAN.md`
- React RND Docs: https://github.com/bokuweb/react-rnd
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- YAMCS Documentation: https://yamcs.org/
- NASA Mission Control: Open MCT

---

## Contributors

- **Implementation:** AI Assistant (Cline)
- **Planning:** System Architect
- **Review:** Development Team

---

**End of Phase 1 Implementation Document**
