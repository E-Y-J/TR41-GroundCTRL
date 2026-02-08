# GroundCTRL HUD System - Complete Documentation
## Comprehensive Mission Control Interface Implementation

**Version:** 1.1  
**Date:** February 8, 2026  
**Status:** ✅ PHASES 1-3 COMPLETE & FULLY INTEGRATED  
**Project:** TR41-GroundCTRL Satellite Simulator

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Phase 1: Foundation & Modular Panels](#phase-1-foundation--modular-panels)
4. [Phase 2: Enhanced 3D Visualization](#phase-2-enhanced-3d-visualization)
5. [Phase 3: Advanced 3D Elements](#phase-3-advanced-3d-elements)
6. [Implementation Status](#implementation-status)
7. [Component Reference](#component-reference)
8. [Integration Guide](#integration-guide)
9. [Future Roadmap](#future-roadmap)

---

## Executive Summary

The GroundCTRL HUD System transforms the satellite simulator into a realistic mission control interface inspired by NASA Flight Control Room (FCR), Open MCT, YAMCS, and modern satellite operations centers.

### Completed Phases

| Phase | Focus | Status | Components |
|-------|-------|--------|------------|
| **Phase 1** | Foundation & Modular Panels | ✅ COMPLETE | 6 draggable panels, TM/TC console, docking system |
| **Phase 2** | Enhanced 3D Visualization | ✅ COMPLETE | Atmosphere shader, orbit gradient |
| **Phase 3** | Advanced 3D Elements | ✅ COMPLETE | Satellite model, ground stations, links, labels, nodes |

### Key Features Delivered

- ✅ **Draggable/Resizable Panels** - 6 subsystem panels with persistent positions
- ✅ **Docking System** - Magnetic docking zones for optimal layout
- ✅ **TM/TC Console** - YAMCS-style telemetry and command logging
- ✅ **Photorealistic Earth** - Atmosphere glow and orbit visualization
- ✅ **3D Satellite Model** - Detailed CubeSat with solar panels
- ✅ **Ground Station Network** - Markers with visibility cones
- ✅ **Communication Links** - Animated data packet transmission
- ✅ **3D HUD Labels** - Billboard text labels for telemetry
- ✅ **Orbital Nodes** - Ascending/Descending node visualization

---

## System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        App Header                               │
├────────────────────────────────────────────────────────────────┤
│                   Mission Steps Panel                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────── DOCKING SYSTEM ─────────────────────┐  │
│  │                                                           │  │
│  │  LEFT DOCK        CENTRAL 3D VIEW         RIGHT DOCK     │  │
│  │  ┌───────┐      ┌──────────────┐        ┌───────────┐  │  │
│  │  │ ADCS  │      │              │        │  Command  │  │  │
│  │  │ Panel │      │   3D Globe   │        │  Console  │  │  │
│  │  ├───────┤      │   + Shaders  │        ├───────────┤  │  │
│  │  │ EPS   │      │   + Orbit    │        │  TM/TC    │  │  │
│  │  │ Panel │      │   + Satellite│        │  Console  │  │  │
│  │  ├───────┤      │   + Stations │        ├───────────┤  │  │
│  │  │ PROP  │      │   + Links    │        │   Comms   │  │  │
│  │  │ Panel │      │   + Labels   │        │   Panel   │  │  │
│  │  └───────┘      └──────────────┘        └───────────┘  │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                      Command Queue Dock                         │
└────────────────────────────────────────────────────────────────┘

└─ FloatingNovaChat (bottom-left) ─┘
```

### Technology Stack

**Frontend:**
- React 19 + Vite 7
- Three.js 0.160+ for 3D graphics
- @react-three/fiber 8.x (React renderer for Three.js)
- @react-three/drei 9.x (Three.js helpers)
- react-rnd 10.4+ (Draggable/resizable components)
- Tailwind CSS 4 (Styling)
- shadcn/ui (UI components)

**Backend:**
- Node.js + Express 5
- Socket.IO 4.8 (Real-time telemetry)
- Firebase/Firestore (Database)
- JWT authentication

---

## Phase 1: Foundation & Modular Panels

**Status:** ✅ COMPLETE  
**Goal:** Establish draggable panel infrastructure with YAMCS-style console

### Components Implemented

#### 1. DraggablePanel Component
**File:** `frontend/src/components/simulator/DraggablePanel.jsx`

Core wrapper for all draggable UI elements.

**Features:**
- Drag and drop via react-rnd
- Resize with min/max constraints
- Minimize/maximize functionality
- Position persistence to localStorage
- Custom drag handles
- Close button support

**Usage:**
```javascript
<DraggablePanel
  id="unique-panel-id"
  title="Panel Title"
  defaultPosition={{ x: 100, y: 100, width: 400, height: 300 }}
  minWidth={300}
  minHeight={200}
  onClose={() => setShowPanel(false)}
>
  {children}
</DraggablePanel>
```

#### 2. SubsystemCard Component
**File:** `frontend/src/components/simulator/SubsystemCard.jsx`

Specialized wrapper for subsystem monitoring panels.

**Features:**
- Status-colored borders (green/yellow/red/gray)
- Alarm badge display
- Status header with icon
- Reusable helper components:
  - `DataRow` - Key-value display
  - `StatusBar` - Visual progress indicator
  - `StatusGlyph` - Colored status dot

**Color Coding:**
- Nominal: Green (`#4caf50`)
- Warning: Yellow (`#ff9800`)
- Critical: Red (`#f44336`)
- Offline: Gray (`#9e9e9e`)

#### 3. DockContainer & DockZone
**Files:** `frontend/src/components/simulator/DockContainer.jsx`, `DockZone.jsx`

Magnetic docking system for panel organization.

**Docking Zones:**
- **Left Dock** - Information panels (ADCS, EPS, Propulsion)
- **Right Dock** - Control panels (Command Console, TM/TC, Comms)
- **Top Dock** - Mission status (Pass timeline, orbit params)
- **Bottom Dock** - Resources (Command queue, health dashboard)

**Features:**
- Snap-to-dock with visual indicators
- Auto-layout adjustment
- Vertical stacking in columns
- Persist dock configuration

#### 4. FloatingTMTCConsole
**File:** `frontend/src/components/simulator/FloatingTMTCConsole.jsx`

YAMCS-style telemetry and command log console.

**Features:**
- Real-time message stream (TM/TC/EVENT)
- Search functionality
- Filter by subsystem, type, severity
- Pause/resume auto-scroll
- Export logs to JSON
- Expandable raw data view
- Color-coded severity
- Message limit (500 default)

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

### Subsystem Panels

#### 5. ADCS Panel (Attitude Determination & Control)
**File:** `frontend/src/components/simulator/panels/ADCSPanel.jsx`

**Displays:**
- Attitude angles (roll, pitch, yaw)
- Angular rates (X, Y, Z axes)
- Reaction wheel speeds (4 wheels)
- Gyroscope status

**Default:** 300x380px @ (50, 150)

#### 6. EPS Panel (Electrical Power System)
**File:** `frontend/src/components/simulator/panels/EPSPanel.jsx`

**Displays:**
- Battery SOC with status bar
- Battery voltage, current, temperature
- Solar array output (4 panels)
- Power budget (generation/consumption)

**Default:** 300x420px @ (360, 150)

#### 7. Comms Panel (Communications)
**File:** `frontend/src/components/simulator/panels/CommsPanel.jsx`

**Displays:**
- Signal strength (dBm)
- Uplink/downlink data rates
- Packet loss percentage
- Active ground station
- Next AOS countdown
- Antenna tracking status

**Default:** 300x360px @ (670, 150)

#### 8. Propulsion Panel
**File:** `frontend/src/components/simulator/panels/PropulsionPanel.jsx`

**Displays:**
- Fuel remaining gauge
- Tank pressure and temperature
- Delta-V budget
- Thruster grid (8 thrusters)
- System ready status

**Default:** 300x400px @ (50, 550)

#### 9. TimeControl Panel
**File:** `frontend/src/components/simulator/panels/TimeControlPanel.jsx`

**Displays:**
- Mission Elapsed Time (MET)
- Current simulation time
- Time acceleration controls
- Pause/resume functionality

### Phase 1 File Structure

```
frontend/src/components/simulator/
├── DraggablePanel.jsx              ✅
├── SubsystemCard.jsx               ✅
├── DockContainer.jsx               ✅
├── DockZone.jsx                    ✅
├── FloatingTMTCConsole.jsx         ✅
└── panels/
    ├── index.js                    ✅
    ├── ADCSPanel.jsx               ✅
    ├── EPSPanel.jsx                ✅
    ├── CommsPanel.jsx              ✅
    ├── PropulsionPanel.jsx         ✅
    └── TimeControlPanel.jsx        ✅
```

---

## Phase 2: Enhanced 3D Visualization

**Status:** ✅ COMPLETE  
**Goal:** Upgrade 3D Earth with realistic atmosphere and orbit visualization

### Components Implemented

#### 1. Atmosphere Shader
**File:** `frontend/src/components/simulator/views/shaders/atmosphereShader.js`

Realistic atmospheric glow using custom GLSL shaders.

**Features:**
- Fresnel-based scattering approximation
- View-dependent glow intensity
- Dynamic camera position tracking
- Blue atmospheric color (RGB: 0.3, 0.6, 1.0)
- Additive blending for authentic effect

**Technical Details:**
- Sphere at 1.018x Earth radius
- Power curves (2.5 and 4.0) for edge emphasis
- Configurable intensity (1.3) and thickness (0.85)
- Real-time uniform updates each frame

**Vertex Shader:**
```glsl
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment Shader:**
```glsl
uniform vec3 glowColor;
uniform float glowIntensity;
uniform float atmosphereThickness;
uniform vec3 cameraPosition;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.5);
  float edgeGlow = pow(1.0 - dot(viewDirection, vNormal), 4.0);
  float intensity = mix(fresnel, edgeGlow, atmosphereThickness);
  
  gl_FragColor = vec4(glowColor * glowIntensity, intensity);
}
```

#### 2. Orbit Gradient Shader
**File:** `frontend/src/components/simulator/views/shaders/orbitGradientShader.js`

Gradient visualization of satellite orbit path (past/present/future).

**Features:**
- Segment-based coloring along orbit
- Real-time satellite position tracking
- Smooth gradient transitions
- Handles wrap-around for circular orbits

**Color Scheme:**
- **Past:** Gray (0.5, 0.5, 0.5) at 50% opacity
- **Present:** White (1.0, 1.0, 1.0) at 90% opacity (at satellite)
- **Future:** Blue (0.2, 0.6, 1.0) at 70% opacity
- **Transition:** 10% gradient spread around satellite

**Implementation:**
```javascript
// Orbit line creation with 128 segments
const orbitLine = createOrbitLine(radius, inclination, raan)

// Real-time progress update in animation loop
orbitLine.material.uniforms.satelliteProgress.value = trueAnomaly / (2 * Math.PI)
```

#### 3. Enhanced EarthGlobe3D
**File:** `frontend/src/components/simulator/views/earth-globe-3d.jsx`

Main 3D visualization component integrating all Phase 2 features.

**Features:**
- High-resolution Earth texture
- Atmosphere glow shader integration
- Orbit path with gradient
- Star field background
- Smooth camera controls (OrbitControls)
- Real-time updates
- Performance optimized (60 FPS target)

### Phase 2 File Structure

```
frontend/src/components/simulator/views/
├── earth-globe-3d.jsx              ✅ Enhanced
└── shaders/
    ├── atmosphereShader.js          ✅ NEW
    └── orbitGradientShader.js       ✅ NEW
```

---

## Phase 3: Advanced 3D Elements

**Status:** ✅ COMPLETE  
**Goal:** Add interactive 3D elements for comprehensive mission visualization

### Components Implemented

#### 1. Satellite3D
**File:** `frontend/src/components/simulator/views/components/Satellite3D.jsx`

Detailed 3D satellite model with PBR materials.

**Features:**
- CubeSat-style main bus (0.1x0.1x0.1 units)
- Two deployable solar panel wings (0.2x0.005x0.1 each)
- Antenna boom (0.15 unit) and dish
- Status indicator with glow (active/idle/comm)
- Optional attitude debug axes (X/Y/Z arrows)
- Metallic PBR materials

**Functions:**
- `createSatellite3D(options)` - Factory function
- `updateSatelliteStatus(satelliteGroup, status)` - Update state

**Status Colors:**
- Active: Blue (#2196f3)
- Idle: Gray (#9e9e9e)
- Communicating: Green (#4caf50)

#### 2. GroundStationMarkers
**File:** `frontend/src/components/simulator/views/components/GroundStationMarkers.jsx`

Ground station visualization on Earth surface.

**Features:**
- Cone/pyramid geometry markers
- Color-coded by type: Green (primary), Blue (backup)
- Pulsing animation for active stations
- Base platform and glow effects
- Lat/lon to 3D position conversion
- Multiple marker management

**Functions:**
- `latLonToVector3(lat, lon, radius)` - Position calculation
- `createGroundStationMarker(station, earthRadius)` - Single marker
- `createGroundStationMarkers(stations, earthRadius)` - Multiple
- `updateStationActive(markerGroup, active)` - State update
- `animateStationMarkers(markerGroups, deltaTime)` - Animation

#### 3. VisibilityCone
**File:** `frontend/src/components/simulator/views/components/VisibilityCone.jsx`

Line-of-sight visualization from station to satellite.

**Features:**
- Semi-transparent cone geometry
- Gradient opacity (bright at base, fades to satellite)
- Visibility checking (elevation angle)
- Animated fade in/out on AOS/LOS
- Dynamic geometry updates

**Functions:**
- `checkVisibility(satPos, stationPos, earthRadius)` - Check LOS
- `createVisibilityCone(stationPos, satPos)` - Create cone
- `updateVisibilityCone(coneMesh, stationPos, satPos)` - Update
- `animateVisibilityCone(coneMesh, visible, deltaTime)` - Fade
- `createVisibilityConeManager()` - Multi-cone manager

**Properties:**
- Color: Cyan (0.2, 0.6, 1.0)
- Base opacity: 0.4, Satellite opacity: 0.05
- 32 segments for smooth circle
- Additive blending

#### 4. CommLink
**File:** `frontend/src/components/simulator/views/components/CommLink.jsx`

Communication link visualization with data packet animation.

**Features:**
- Color-coded by link quality:
  - Green: Good (elevation >60°, strength >0.6)
  - Yellow: Marginal (30-60°, 0.3-0.6)
  - Red: Poor (<30°, <0.3)
- Dashed line style
- Animated data packets traveling along link
- Packet glow effects
- Pulse animation on line

**Functions:**
- `calculateLinkQuality(elevation, distance)` - Quality calc
- `createCommLink(satPos, stationPos, quality)` - Create link
- `updateCommLink(linkLine, satPos, stationPos, quality)` - Update
- `animateCommLink(linkLine, scene, deltaTime)` - Animate packets
- `createCommLinkManager(scene)` - Multi-link manager

**Packet Animation:**
- 2-second travel time station→satellite
- Spawn rate based on quality
- Fade out in final 20%
- Auto cleanup

#### 5. HUDLabels
**File:** `frontend/src/components/simulator/views/components/HUDLabels.jsx`

3D billboard text labels using canvas sprites.

**Features:**
- Always face camera (billboard effect)
- Distance-based scaling (0.5x to 2.0x)
- Semi-transparent background panels
- Multiple label types:
  - Satellite telemetry (altitude, velocity, lat/lon)
  - Ground station names with elevation
  - Cardinal directions (N, S, E, W)
  - Orbital node labels (AN/DN)

**Functions:**
- `createTextLabel(text, options)` - Base sprite label
- `updateTextLabel(sprite, text)` - Update existing
- `createSatelliteLabel(telemetry)` - Satellite info
- `createStationLabel(name, elevation)` - Station label
- `createCardinalLabel(direction)` - Direction marker
- `createNodeLabel(type)` - Node label (AN/DN)
- `updateLabelScale(sprite, cameraPos, min, max)` - Scale
- `createLabelManager(scene)` - Label manager
- `createCardinalLabels(earthRadius, distance)` - All 4 directions

**Styling:**
- Monospace font for telemetry
- Sans-serif for names
- Context-appropriate colors
- Semi-transparent black backgrounds

#### 6. OrbitalNodes
**File:** `frontend/src/components/simulator/views/components/OrbitalNodes.jsx`

Ascending and Descending node visualization.

**Features:**
- Calculates AN/DN where orbit crosses equator
- Color-coded: Green (AN), Red (DN)
- Directional arrows (up for AN, down for DN)
- Rotating ring indicators
- Pulsing glow animations
- Metallic PBR sphere markers (0.03 unit radius)

**Functions:**
- `calculateOrbitalNodes(radius, incl, raan)` - Calculate positions
- `createNodeMarker(type, position)` - Single marker
- `updateNodeMarker(marker, position)` - Update position
- `animateNodeMarker(marker, deltaTime)` - Pulse/rotate
- `createOrbitalNodes(radius, incl, raan)` - Both nodes
- `updateOrbitalNodes(ascending, descending, radius, incl, raan)` - Update both
- `createOrbitalNodesManager(scene)` - Manager with show/hide

**Marker Design:**
- Main sphere: 0.03 radius with emissive
- Glow sphere: 0.04 radius, transparent
- Arrow: 0.08 length
- Ring: 0.035 torus, rotates
- Pulse: 2 rad/s sine wave

### Phase 3 File Structure

```
frontend/src/components/simulator/views/components/
├── Satellite3D.jsx                  ✅
├── GroundStationMarkers.jsx         ✅
├── VisibilityCone.jsx               ✅
├── CommLink.jsx                     ✅
├── HUDLabels.jsx                    ✅
└── OrbitalNodes.jsx                 ✅
```

---

## Implementation Status

### Completed ✅

| Component | Status | Location | Phase |
|-----------|--------|----------|-------|
| DraggablePanel | ✅ | `simulator/DraggablePanel.jsx` | 1 |
| SubsystemCard | ✅ | `simulator/SubsystemCard.jsx` | 1 |
| DockContainer | ✅ | `simulator/DockContainer.jsx` | 1 |
| DockZone | ✅ | `simulator/DockZone.jsx` | 1 |
| FloatingTMTCConsole | ✅ | `simulator/FloatingTMTCConsole.jsx` | 1 |
| ADCS Panel | ✅ | `simulator/panels/ADCSPanel.jsx` | 1 |
| EPS Panel | ✅ | `simulator/panels/EPSPanel.jsx` | 1 |
| Comms Panel | ✅ | `simulator/panels/CommsPanel.jsx` | 1 |
| Propulsion Panel | ✅ | `simulator/panels/PropulsionPanel.jsx` | 1 |
| TimeControl Panel | ✅ | `simulator/panels/TimeControlPanel.jsx` | 1 |
| Atmosphere Shader | ✅ | `views/shaders/atmosphereShader.js` | 2 |
| Orbit Gradient Shader | ✅ | `views/shaders/orbitGradientShader.js` | 2 |
| EarthGlobe3D Enhanced | ✅ | `views/earth-globe-3d.jsx` | 2 |
| Satellite3D | ✅ | `views/components/Satellite3D.jsx` | 3 |
| GroundStationMarkers | ✅ | `views/components/GroundStationMarkers.jsx` | 3 |
| VisibilityCone | ✅ | `views/components/VisibilityCone.jsx` | 3 |
| CommLink | ✅ | `views/components/CommLink.jsx` | 3 |
| HUDLabels | ✅ | `views/components/HUDLabels.jsx` | 3 |
| OrbitalNodes | ✅ | `views/components/OrbitalNodes.jsx` | 3 |

### Phase Integration Status

**Phase 1:** ✅ Fully integrated and operational  
**Phase 2:** ✅ Fully integrated and operational  
**Phase 3:** ✅ Fully integrated and operational

All Phase 3 components are implemented and fully integrated into `earth-globe-3d.jsx`. Ground stations are dynamically loaded from scenario sessions via WebSocket.

---

## Component Reference

### Quick Reference Table

| Component | Type | Purpose | Key Features |
|-----------|------|---------|--------------|
| DraggablePanel | UI Wrapper | Base draggable container | Drag, resize, persist |
| SubsystemCard | UI Wrapper | Subsystem panel wrapper | Status colors, alarms |
| DockContainer | Layout | Docking system | Magnetic snapping |
| FloatingTMTCConsole | Console | TM/TC logging | Filter, search, export |
| ADCSPanel | Panel | Attitude monitoring | Angles, rates, wheels |
| EPSPanel | Panel | Power monitoring | Battery, solar, budget |
| CommsPanel | Panel | Communications | Signal, rates, passes |
| PropulsionPanel | Panel | Propulsion | Fuel, thrusters, ΔV |
| TimeControlPanel | Panel | Time control | MET, pause, speed |
| Atmosphere Shader | 3D Shader | Earth glow | Fresnel, view-dependent |
| Orbit Gradient | 3D Shader | Orbit visualization | Past/present/future |
| Satellite3D | 3D Model | Satellite representation | Bus, panels, antenna |
| GroundStationMarkers | 3D Markers | Station locations | Cones, pulse, colors |
| VisibilityCone | 3D Geometry | LOS visualization | Transparent cone |
| CommLink | 3D Line | Data transmission | Quality colors, packets |
| HUDLabels | 3D Text | Information overlay | Billboard, scaling |
| OrbitalNodes | 3D Markers | AN/DN positions | Green/red, arrows |

---

## Integration Guide

### Phase 1 Integration (Already Complete)

Phase 1 panels are fully integrated into the Simulator page:

```javascript
// In Simulator.jsx
import { FloatingTMTCConsole } from './FloatingTMTCConsole'
import { ADCSPanel, EPSPanel, CommsPanel, PropulsionPanel } from './panels'

// Panel visibility state
const [showTMTCConsole, setShowTMTCConsole] = useState(true)
const [showADCSPanel, setShowADCSPanel] = useState(true)
// ... etc

// Render panels
{showTMTCConsole && (
  <FloatingTMTCConsole
    sessionId={currentSessionId}
    onClose={() => setShowTMTCConsole(false)}
  />
)}
{showADCSPanel && (
  <ADCSPanel
    telemetry={telemetry}
    status={status}
    onClose={() => setShowADCSPanel(false)}
  />
)}
```

### Phase 3 Integration Pattern

To fully integrate Phase 3 components into the 3D view:

```javascript
// In earth-globe-3d.jsx
import { createGroundStationMarkers, animateStationMarkers } from './components/GroundStationMarkers'
import { createVisibilityConeManager } from './components/VisibilityCone'
import { createCommLinkManager } from './components/CommLink'
import { createLabelManager, createCardinalLabels } from './components/HUDLabels'
import { createOrbitalNodesManager } from './components/OrbitalNodes'

// In component setup useEffect:
const stationMarkers = createGroundStationMarkers(GROUND_STATIONS, EARTH_RADIUS)
scene.add(stationMarkers)

const coneManager = createVisibilityConeManager()
const linkManager = createCommLinkManager(scene)
const labelManager = createLabelManager(scene)
const nodesManager = createOrbitalNodesManager(scene)

// Add cardinal labels
const cardinalLabels = createCardinalLabels(EARTH_RADIUS, 1.3)
scene.add(cardinalLabels)

// In animation loop:
animateStationMarkers(stationMarkers.children, deltaTime)
coneManager.animate(deltaTime)
linkManager.animateAll(deltaTime)
nodesManager.animate(deltaTime)
labelManager.updateAllScales(camera.position)

// Cleanup on unmount:
coneManager.dispose(scene)
linkManager.dispose(scene)
labelManager.dispose(scene)
nodesManager.dispose()
```

### Data Flow

```
Backend (Socket.IO)
    ↓
SimulatorStateContext
    ↓
├── Panels (Phase 1) ← Telemetry data
│   ├── ADCSPanel
│   ├── EPSPanel
│   ├── CommsPanel
│   └── PropulsionPanel
│
└── EarthGlobe3D (Phases 2 & 3) ← Position/orbit data
    ├── Atmosphere
    ├── Orbit line
    ├── Satellite3D
    ├── Ground stations
    ├── Visibility cones
    ├── Comm links
    ├── Labels
    └── Orbital nodes
```

---

## Future Roadmap

### Phase 4: Real-time Data Integration (Planned)
- Live TLE updates from space-track.org
- Real-time telemetry display
- Historical orbit playback
- WebSocket telemetry streams
- Time conductor (live/fixed/replay modes)

### Phase 5: Pass Prediction & Timeline (Planned)
- Pass contact timeline (SatNOGS-style)
- AOS/LOS predictions
- Elevation profiles
- Multi-station scheduling
- Contact quality assessment

### Phase 6: Advanced Analysis Tools (Planned)
- Coverage analysis
- Multi-satellite coordination
- Conjunction assessment
- Ground track visualization improvements
- Custom telemetry charts

### Phase 7: User Interaction Enhancements (Planned)
- Click-to-select satellites
- Manual attitude control
- Mission planning tools
- Scenario creation
- Training mode with scoring

### Phase 8: Performance & Polish (Planned)
- WebGL optimization
- LOD (Level of Detail) system
- Loading screen improvements
- Accessibility features (WCAG 2.1 AA)
- Mobile/tablet responsive design
- Unit/integration/E2E tests

---

## Technical Specifications

### Performance Targets

- **Frame Rate:** 60 FPS on desktop, 30 FPS on laptops
- **Memory:** < 500MB for full interface
- **WebSocket Latency:** < 100ms
- **Panel Responsiveness:** < 16ms drag/resize
- **Time-to-Interactive:** < 3s initial load

### Browser Compatibility

- Chrome/Edge: Version 90+
- Firefox: Version 88+
- Safari: Version 14+
- WebGL 2.0 support required

### Dependencies

```json
{
  "react": "^19.0.0",
  "three": "^0.160.0",
  "@react-three/fiber": "^8.18.0",
  "@react-three/drei": "^9.130.0",
  "react-rnd": "^10.4.13",
  "socket.io-client": "^4.8.3",
  "recharts": "^3.7.0"
}
```

---

## Design Patterns

### Factory Functions (Phase 3)

All Phase 3 components use factory function pattern for vanilla Three.js compatibility:

```javascript
export function createComponent(options) {
  const group = new THREE.Group()
  // ... create geometry and materials
  return group
}

export function updateComponent(componentGroup, newData) {
  // ... update component state
}

export function animateComponent(componentGroup, deltaTime) {
  // ... animation logic
}
```

### Manager Pattern (Multi-instance Control)

```javascript
export function createComponentManager() {
  const instances = new Map()
  
  return {
    create(id, options) { /* ... */ },
    update(id, data) { /* ... */ },
    remove(id) { /* ... */ },
    animateAll(deltaTime) { /* ... */ },
    dispose() { /* ... */ }
  }
}
```

### Component Lifecycle

1. **Creation** - Factory function instantiates Three.js objects
2. **Addition** - Add to scene graph
3. **Animation** - Update in animation loop
4. **Cleanup** - Dispose geometry/materials on unmount

---

## Testing Strategy

### Unit Tests
- Panel component rendering
- Draggable functionality
- Filter/search logic
- State persistence

### Integration Tests
- TM/TC console receives telemetry
- Panels update with new data
- Docking system functionality
- WebSocket reconnection

### E2E Tests (Playwright)
- Complete mission workflow
- Panel drag and dock
- Command submission
- 3D visualization interaction

### Performance Tests
- Frame rate monitoring
- Memory leak detection
- WebSocket latency
- Panel responsiveness

---

## Conclusion

The GroundCTRL HUD System successfully transforms the satellite simulator into a professional-grade mission control interface. With Phases 1-3 complete, the system provides:

✅ **Professional Interface** - Modular, draggable panels inspired by NASA FCR  
✅ **Realistic Visualization** - Photorealistic 3D Earth with advanced elements  
✅ **Real-time Monitoring** - YAMCS-style telemetry console  
✅ **Mission Context** - Ground stations, comm links, orbital nodes  
✅ **Extensible Architecture** - Ready for future enhancements  

The implementation follows industry best practices, maintains high performance, and provides an immersive training environment for satellite operations.

---

## Recent Fixes & Enhancements

### February 8, 2026 - Three.js Error Resolution

**Fixed Critical Three.js Errors:**

1. **Shader Compilation Error** ✅
   - Removed duplicate `cameraPosition` uniform declaration from atmosphere fragment shader
   - Three.js provides this as a built-in uniform, no need to declare it
   - File: `frontend/src/components/simulator/views/shaders/atmosphereShader.js`

2. **CommLink TypeError** ✅
   - Fixed `Cannot read properties of undefined (reading 'add')` error
   - Updated CommLink manager API to properly pass scene parameter
   - Returns `{ line, packetsGroup }` structure correctly
   - File: `frontend/src/components/simulator/views/components/CommLink.jsx`

3. **THREE.Object3D.add Errors** ✅
   - Fixed `createCardinalLabels()` to return a proper THREE.Group instead of an array
   - Cardinal direction labels (N, S, E, W) now display correctly
   - File: `frontend/src/components/simulator/views/components/HUDLabels.jsx`

4. **Ground Station Labels** ✅
   - Fixed labels displaying "[object Object]" instead of station names
   - Changed from passing object to passing string: `createStationLabel(station.name)`
   - File: `frontend/src/components/simulator/views/earth-globe-3d.jsx`

5. **Canvas Texture GL_INVALID_VALUE** ✅
   - Fixed `glCopySubTextureCHROMIUM: Offset overflows texture dimensions` error
   - Improved canvas texture update logic:
     - Skip updating if text hasn't changed
     - Only resize canvas when dimensions change significantly (>2px threshold)
     - Properly dispose old textures before creating new ones
     - Use integer canvas dimensions with Math.ceil
   - File: `frontend/src/components/simulator/views/components/HUDLabels.jsx`

### Ground Station Integration

**Complete Ground Station System** ✅

1. **Scenario Session Schema Updated**
   - All scenario sessions now include `groundStationIds` array
   - Links to all 7 global ground stations:
     - SVALBARD (Norway)
     - ALASKA (USA)
     - HAWAII (USA)
     - AUSTRALIA (New Norcia)
     - SOUTH_AFRICA (Hartebeesthoek)
     - CHILE (Santiago)
     - ANTARCTICA (Troll Station)
   - Files: `backend/seeders/data/scenarioSessions.js`, `backend/seeders/seed.js`

2. **Dynamic Ground Station Loading**
   - Ground stations loaded from WebSocket data during simulation
   - Fallback to default stations if no session data available
   - Real-time visibility checking with elevation calculations
   - Automatic AOS/LOS detection with visual feedback

### Mission Briefing Enhancements

**Skip Animation Functionality** ✅

Added "Skip to Simulator" buttons to all animation phases:

1. **Briefing Phase**
   - "Skip Briefing" button in Navbar (already existed)
   - Creates session and navigates directly to simulator

2. **Countdown Phase** (NEW)
   - "Skip to Simulator" button appears after session creation
   - Allows skipping 10-second countdown animation
   - File: `frontend/src/pages/MissionBriefing.jsx`

3. **Launch Phase** (NEW)
   - "Skip to Simulator" button during rocket launch animation
   - Bypasses launch progress visualization
   - Immediate navigation to simulator with session ID

**Benefits:**
- Users have full control over mission start experience
- Reduces wait time for experienced operators
- Maintains full animation sequence for first-time users

---

## Document History

- **v1.1** - February 8, 2026 - Added recent fixes, ground station integration, mission briefing enhancements
- **v1.0** - February 8, 2026 - Initial combined documentation
- Consolidates: HUD_ENHANCEMENT_PLAN.md, HUD_IMPLEMENTATION_PHASE1.md, HUD_IMPLEMENTATION_PHASE2.md, HUD_IMPLEMENTATION_PHASE3.md, HUD_PHASE3_COMPLETE.md

---

## References

- NASA Mission Control Center Documentation
- Open MCT Developer Guide: https://nasa.github.io/openmct/
- YAMCS Documentation: https://yamcs.org/
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Three.js Documentation: https://threejs.org/docs/
- SatNOGS Network: https://network.satnogs.org/
- CCSDS Standards: https://public.ccsds.org/

---

**END OF DOCUMENT**
