# NASA-Style Mission Control HUD Implementation

## 🚀 Overview

This document describes the implementation of authentic NASA-style mission control HUD components for the GroundCTRL satellite simulator. These components follow real-world flight control conventions (NASA / ESA / industry standard), not consumer dashboard patterns.

**Implementation Date:** 2026-02-09  
**Architecture:** Option A (Parallel System) - Zero breaking changes to existing components

---

## 📁 Files Created

### 1. Configuration
- **`frontend/src/config/hudConfig.js`**
  - Single source of truth for HUD configuration
  - Mission metadata, severity levels, subsystem definitions
  - Flight Director Strip configuration

### 2. Components
- **`frontend/src/components/simulator/AlarmPanel.jsx`**
  - Latched alarm system (critical authentic feature)
  - NASA severity levels: INFO, CAUTION, WARNING, CRITICAL
  - Alarms persist until acknowledged, even if telemetry recovers

- **`frontend/src/components/simulator/TmTcLog.jsx`**
  - Telemetry/Command log with NASA-style severity filtering
  - INFO+, CAUTION+, WARNING+, CRITICAL filters
  - Standardized TM/TC event format

- **`frontend/src/components/simulator/FlightDirectorStrip.jsx`**
  - GO / NO-GO status bar
  - Top-level subsystem health overview
  - Procedurally renders from config

### 3. Context Enhancements
- **`frontend/src/contexts/SimulatorStateContext.jsx`**
  - Added `nasaAlarms` array (separate from existing `alerts`)
  - Added `addNasaAlarm()` and `acknowledgeNasaAlarm()` handlers
  - Latched alarm state management

---

## 🎯 Architecture: Parallel System (Option A)

### Why Parallel?
- **Zero Breaking Changes:** Existing AlertPanel and FloatingTMTCConsole remain functional
- **Safe Rollback:** New components can be removed without affecting existing features
- **Clear Separation:** Old system (lowercase severity) vs NASA system (uppercase severity)

### Two Independent Systems

#### Legacy System (Existing)
```javascript
// Severity levels: 'nominal', 'info', 'warning', 'critical', 'success'
const { alerts, addAlert, acknowledgeAlert } = useSimulatorState();

// Auto-dismissing alerts
addAlert({
  severity: 'warning',
  subsystem: 'ADCS',
  message: 'Temporary issue'
});
```

#### NASA System (New)
```javascript
// Severity levels: 'INFO', 'CAUTION', 'WARNING', 'CRITICAL'
const { nasaAlarms, addNasaAlarm, acknowledgeNasaAlarm } = useSimulatorState();

// Latched alarms (persist until ACK)
addNasaAlarm({
  severity: 'WARNING',
  subsystem: 'ADCS',
  message: 'Rate error exceeded threshold',
  latched: true
});
```

---

## 📊 Data Structures

### HUD Configuration
```javascript
// frontend/src/config/hudConfig.js
{
  mission: {
    name: "LEO-OPS-01",
    vehicle: "CUBESAT-3U",
    flightDirector: "FD-01"
  },

  severityLevels: {
    INFO: { priority: 0 },
    CAUTION: { priority: 1 },
    WARNING: { priority: 2 },
    CRITICAL: { priority: 3 }
  },

  flightDirectorStrip: [
    { key: "MODE", label: "MODE" },
    { key: "COMMS", label: "COMMS" },
    { key: "POWER", label: "POWER" },
    { key: "THERMAL", label: "THERMAL" },
    { key: "ADCS", label: "ADCS" }
  ],

  subsystems: [
    {
      id: "POWER",
      label: "POWER",
      nominal: true,
      telemetry: ["battery", "busVoltage", "solarState"]
    }
    // ... more subsystems
  ]
}
```

### Alarm State Model
```javascript
{
  id: "ADCS_RATE_HIGH",
  subsystem: "ADCS",
  severity: "WARNING",
  message: "Rate error exceeded limit",
  latched: true,          // Persists until acknowledged
  acknowledged: false,     // Operator must ACK
  timestamp: "18:42:11"
}
```

### TM/TC Event Model
```javascript
{
  time: "18:42:11",
  type: "TM",                // TM | TC
  subsystem: "ADCS",
  severity: "WARNING",       // INFO | CAUTION | WARNING | CRITICAL
  message: "Rate error exceeded threshold"
}
```

### Flight Director Status Model
```javascript
{
  MODE: "NOMINAL",
  COMMS: "GO",
  POWER: "GO",
  THERMAL: "GO",
  ADCS: "NO-GO"
}
```

---

## 🔧 Usage Examples

### 1. AlarmPanel - Latched Alarms

```javascript
import { useSimulatorState } from "@/contexts/SimulatorStateContext";
import AlarmPanel from "@/components/simulator/AlarmPanel";

function MissionControl() {
  const { nasaAlarms, acknowledgeNasaAlarm } = useSimulatorState();
  
  return (
    <AlarmPanel 
      alarms={nasaAlarms} 
      onAcknowledge={acknowledgeNasaAlarm} 
    />
  );
}
```

**To create an alarm:**
```javascript
const { addNasaAlarm } = useSimulatorState();

// Alarm stays visible until ACK'd, even if condition clears
addNasaAlarm({
  severity: 'CRITICAL',      // INFO | CAUTION | WARNING | CRITICAL
  subsystem: 'POWER',
  message: 'Bus voltage below threshold'
});
```

### 2. TmTcLog - Telemetry/Command Log

```javascript
import TmTcLog from "@/components/simulator/TmTcLog";

function LogPanel() {
  const entries = [
    {
      time: "18:42:11",
      type: "TM",
      subsystem: "ADCS",
      severity: "WARNING",
      message: "Rate error exceeded threshold"
    },
    {
      time: "18:42:15",
      type: "TC",
      subsystem: "POWER",
      severity: "INFO",
      message: "Command SET_POWER_MODE executed"
    }
  ];
  
  return <TmTcLog entries={entries} />;
}
```

**Severity Filtering:**
- **INFO+**: Shows INFO, CAUTION, WARNING, CRITICAL (all events)
- **CAUTION+**: Shows CAUTION, WARNING, CRITICAL (hides INFO)
- **WARNING+**: Shows WARNING, CRITICAL (hides INFO, CAUTION)
- **CRITICAL**: Shows only CRITICAL events

### 3. FlightDirectorStrip - GO/NO-GO Status

```javascript
import FlightDirectorStrip from "@/components/simulator/FlightDirectorStrip";
import { hudConfig } from "@/config/hudConfig";

function MissionOverview({ telemetry }) {
  // Map telemetry to GO/NO-GO status
  const status = {
    MODE: telemetry?.mode === 'nominal' ? 'NOMINAL' : 'SAFE',
    COMMS: telemetry?.subsystems?.comms?.status === 'nominal' ? 'GO' : 'NO-GO',
    POWER: telemetry?.subsystems?.power?.batterySoc > 20 ? 'GO' : 'NO-GO',
    THERMAL: telemetry?.subsystems?.thermal?.status === 'nominal' ? 'GO' : 'NO-GO',
    ADCS: telemetry?.subsystems?.adcs?.status === 'nominal' ? 'GO' : 'NO-GO'
  };
  
  return (
    <FlightDirectorStrip 
      config={hudConfig.flightDirectorStrip} 
      status={status} 
    />
  );
}
```

---

## 🎨 Visual Hierarchy

### Severity Colors (NASA Style)
- **INFO**: Blue (`bg-blue-500/10`, `text-blue-500`)
- **CAUTION**: Yellow (`bg-yellow-500/10`, `text-yellow-500`)
- **WARNING**: Orange (`bg-orange-500/10`, `text-orange-500`)
- **CRITICAL**: Red (`bg-red-500/10`, `text-red-500`)

### Status Colors (Flight Director)
- **GO / NOMINAL**: Green (`bg-green-500/10`, `text-green-500`)
- **NO-GO / CRITICAL**: Red (`bg-red-500/10`, `text-red-500`)
- **HOLD / CAUTION**: Yellow (`bg-yellow-500/10`, `text-yellow-500`)
- **UNKNOWN**: Gray (`bg-muted`, `text-muted-foreground`)

---

## 🔄 Integration Flow

```
hudConfig.json (Source of Truth)
     ↓
Telemetry Stream → TM/TC Log → Severity Filtering
     ↓                 ↓
Subsystem Status → Alarms (Latched) → Acknowledgment
     ↓
Flight Director Strip (GO / NO-GO)
```

### Data Flow
1. **Telemetry Updates** → SimulatorStateContext
2. **Threshold Violations** → `addNasaAlarm()` creates latched alarm
3. **Alarm Display** → AlarmPanel shows unacknowledged alarms
4. **Operator Action** → Clicks ACK → `acknowledgeNasaAlarm()`
5. **Alarm Removal** → Alarm disappears from panel
6. **Status Aggregation** → FlightDirectorStrip shows subsystem health

---

## 🚦 Critical Features

### 1. Latched Alarm Behavior (Most Important)
**Why it matters:** Flight controllers trust latched alarms. You never miss a transient fault.

```javascript
// Scenario: Bus voltage drops to 18V (threshold: 20V)
addNasaAlarm({
  severity: 'CRITICAL',
  subsystem: 'POWER',
  message: 'Bus voltage below 20V (18V)',
  latched: true
});

// Even if voltage recovers to 22V, alarm STAYS VISIBLE
// Operator must acknowledge to confirm they've seen the issue
// This prevents "missed" transient faults
```

### 2. Config-Driven Rendering
All UI structure comes from `hudConfig.js` - no hardcoded layouts.

### 3. Procedural Subsystem Mapping
FlightDirectorStrip renders whatever subsystems are defined in config.

---

## 📝 Implementation Notes

### What Was NOT Changed
- ✅ Existing `AlertPanel` - still works with lowercase severity
- ✅ Existing `FloatingTMTCConsole` - unchanged
- ✅ All existing simulator components
- ✅ No refactoring of legacy code

### What Was Added
- ✅ `nasaAlarms` array in SimulatorStateContext
- ✅ `addNasaAlarm()` and `acknowledgeNasaAlarm()` handlers
- ✅ Three new NASA-style components
- ✅ HUD configuration file

### Migration Path (Future)
If you want to eventually deprecate the old alert system:
1. Replace `addAlert()` calls with `addNasaAlarm()`
2. Replace `AlertPanel` with `AlarmPanel` in Simulator.jsx
3. Remove legacy alert system after full migration

---

## 🧪 Testing Recommendations

### Test Latched Alarm Behavior
```javascript
// 1. Create alarm
addNasaAlarm({
  severity: 'WARNING',
  subsystem: 'THERMAL',
  message: 'Temperature exceeded limit'
});

// 2. Verify alarm appears in AlarmPanel
// 3. "Fix" the issue (telemetry returns to normal)
// 4. Verify alarm STILL appears (latched)
// 5. Click ACK button
// 6. Verify alarm disappears
```

### Test Severity Filtering
```javascript
// Create events with different severities
const events = [
  { severity: 'INFO', message: 'Routine check' },
  { severity: 'CAUTION', message: 'Minor issue' },
  { severity: 'WARNING', message: 'Attention needed' },
  { severity: 'CRITICAL', message: 'Immediate action' }
];

// Test each filter level shows correct events
// INFO+ should show all 4
// CAUTION+ should show 3 (no INFO)
// WARNING+ should show 2 (no INFO, CAUTION)
// CRITICAL should show 1
```

---

## 📚 References

- NASA Mission Control Center operations
- ESA Columbus Control Center protocols
- SpaceX Dragon control conventions
- YAMCS telemetry/command framework

---

## 🎯 Next Steps (Optional Enhancements)

1. **Wire Telemetry to Alarms**
   - Add threshold monitoring in SimulatorStateContext
   - Auto-create alarms when thresholds are violated

2. **Connect Flight Director Strip**
   - Add FlightDirectorStrip to Simulator.jsx
   - Map real telemetry to GO/NO-GO status

3. **TM/TC Log Integration**
   - Feed real telemetry updates into TmTcLog
   - Capture command history from executeCommand()

4. **Alarm Sound Effects**
   - Add audio alerts for CRITICAL alarms
   - Implement master alarm system

5. **Alarm History**
   - Store acknowledged alarms for review
   - Export alarm log for post-mission analysis

---

## ✅ Summary

This implementation provides authentic, NASA-style mission control HUD components that:
- ✅ Follow real-world flight control conventions
- ✅ Implement latched alarm behavior (critical feature)
- ✅ Use config-driven architecture
- ✅ Maintain zero breaking changes to existing code
- ✅ Provide clear migration path for future enhancements

The components are production-ready and can be integrated into the simulator as needed.
