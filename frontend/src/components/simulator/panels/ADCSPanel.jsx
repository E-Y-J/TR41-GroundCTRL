/**
 * ADCSPanel - Attitude Determination & Control System Panel
 * 
 * Displays attitude angles, angular rates, reaction wheel speeds, and gyro status.
 * Part of the modular mission control console system.
 */

import { StaticPanel } from "../StaticPanel"
import { DataRow, StatusGlyph } from "../SubsystemCard"
import { Compass } from "lucide-react"

export function ADCSPanel({ telemetry, status = "nominal" }) {
  // Extract ADCS telemetry (use fallback values if not available)
  const adcs = telemetry?.subsystems?.adcs || {}
  const attitude = adcs.attitude || { roll: 0, pitch: 0, yaw: 0 }
  const angularRates = adcs.angularRates || { x: 0, y: 0, z: 0 }
  const reactionWheels = adcs.reactionWheels || [
    { id: 1, speed: 0, status: "nominal" },
    { id: 2, speed: 0, status: "nominal" },
    { id: 3, speed: 0, status: "nominal" },
    { id: 4, speed: 0, status: "nominal" },
  ]

  return (
    <StaticPanel
      id="adcs-panel"
      title="🧭 Attitude Control"
      minHeight={380}
    >
      {/* Attitude Angles */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Attitude (deg)
        </div>
        <DataRow label="Roll" value={attitude.roll?.toFixed(2) || "0.00"} unit="°" />
        <DataRow label="Pitch" value={attitude.pitch?.toFixed(2) || "0.00"} unit="°" />
        <DataRow label="Yaw" value={attitude.yaw?.toFixed(2) || "0.00"} unit="°" />
      </div>

      {/* Angular Rates */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Angular Rates (deg/s)
        </div>
        <DataRow label="X-axis" value={angularRates.x?.toFixed(3) || "0.000"} unit="°/s" />
        <DataRow label="Y-axis" value={angularRates.y?.toFixed(3) || "0.000"} unit="°/s" />
        <DataRow label="Z-axis" value={angularRates.z?.toFixed(3) || "0.000"} unit="°/s" />
      </div>

      {/* Reaction Wheels */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Reaction Wheels
        </div>
        <div className="grid grid-cols-2 gap-2">
          {reactionWheels.map((wheel) => (
            <div
              key={wheel.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border"
            >
              <div className="flex items-center gap-2">
                <StatusGlyph status={wheel.status || "nominal"} size="sm" />
                <span className="text-xs text-muted-foreground">RW{wheel.id}</span>
              </div>
              <span className="text-xs font-mono font-semibold">
                {wheel.speed?.toFixed(0) || "0"}
                <span className="text-muted-foreground text-[10px] ml-1">RPM</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gyro Status */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
          <div className="flex items-center gap-2">
            <StatusGlyph status={adcs.gyroStatus || "nominal"} size="sm" pulse />
            <span className="text-xs text-muted-foreground">Gyroscope</span>
          </div>
          <span className="text-xs font-mono font-semibold text-green-500">
            {adcs.gyroStatus === "nominal" ? "ACTIVE" : "FAULT"}
          </span>
        </div>
      </div>
    </StaticPanel>
  )
}

export default ADCSPanel
