/**
 * PropulsionPanel - Propulsion System Panel
 * 
 * Displays fuel remaining, thruster status, delta-V budget, and tank pressure.
 * Part of the modular mission control console system.
 */

import { SubsystemCard, DataRow, StatusBar, StatusGlyph } from "../SubsystemCard"
import { Rocket } from "lucide-react"

export function PropulsionPanel({ telemetry, status = "nominal", onClose }) {
  // Extract propulsion telemetry
  const propulsion = telemetry?.subsystems?.propulsion || {}
  const fuelRemaining = propulsion.fuelRemaining || 100
  const tankPressure = propulsion.tankPressure || 250
  const tankTemp = propulsion.tankTemp || 20
  const deltaV = propulsion.deltaVBudget || 150
  const thrusters = propulsion.thrusters || [
    { id: 1, status: "nominal" },
    { id: 2, status: "nominal" },
    { id: 3, status: "nominal" },
    { id: 4, status: "nominal" },
    { id: 5, status: "nominal" },
    { id: 6, status: "nominal" },
    { id: 7, status: "nominal" },
    { id: 8, status: "nominal" },
  ]

  // Determine fuel status
  const getFuelStatus = (fuel) => {
    if (fuel < 10) return "critical"
    if (fuel < 30) return "warning"
    return "nominal"
  }

  const fuelStatus = getFuelStatus(fuelRemaining)

  return (
    <SubsystemCard
      subsystem="PROP"
      title="🚀 Propulsion"
      icon={Rocket}
      telemetry={telemetry}
      status={status}
      alarmCount={0}
      defaultPosition={{ x: 50, y: 550, width: 300, height: 400 }}
      onClose={onClose}
    >
      {/* Fuel Status */}
      <div className="space-y-2">
        <StatusBar
          label="Fuel Remaining"
          value={fuelRemaining}
          max={100}
          status={fuelStatus}
          showPercentage
        />
      </div>

      {/* Tank Details */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Tank Status
        </div>
        <DataRow label="Pressure" value={tankPressure.toFixed(1)} unit="psi" />
        <DataRow label="Temperature" value={tankTemp.toFixed(1)} unit="°C" />
        <DataRow 
          label="Mass" 
          value={(fuelRemaining * 0.5).toFixed(1)} 
          unit="kg" 
        />
      </div>

      {/* Delta-V Budget */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Delta-V Budget
        </div>
        <div className="p-3 bg-muted/30 rounded border border-border text-center">
          <div className="text-2xl font-mono font-bold text-primary">
            {deltaV.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground">m/s available</div>
        </div>
      </div>

      {/* Thrusters Grid */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Thrusters
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {thrusters.map((thruster) => (
            <div
              key={thruster.id}
              className="flex flex-col items-center justify-center p-2 bg-muted/30 rounded border border-border"
            >
              <StatusGlyph status={thruster.status || "nominal"} size="sm" />
              <span className="text-[10px] text-muted-foreground mt-1">T{thruster.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
          <div className="flex items-center gap-2">
            <StatusGlyph status="nominal" size="sm" pulse />
            <span className="text-xs text-muted-foreground">System</span>
          </div>
          <span className="text-xs font-mono font-semibold text-green-500">READY</span>
        </div>
      </div>
    </SubsystemCard>
  )
}

export default PropulsionPanel
