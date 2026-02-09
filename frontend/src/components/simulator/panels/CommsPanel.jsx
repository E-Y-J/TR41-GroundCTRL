/**
 * CommsPanel - Communications System Panel
 * 
 * Displays signal strength, data rates, ground station status, and antenna pointing.
 * Part of the modular mission control console system.
 */

import { StaticPanel } from "../StaticPanel"
import { DataRow, StatusGlyph } from "../SubsystemCard"
import { Radio, Signal } from "lucide-react"

export function CommsPanel({ telemetry, status = "nominal" }) {
  // Extract communications telemetry
  const comms = telemetry?.communications || {}
  const signalStrength = comms.signalStrength || -85
  const uplinkRate = comms.uplinkRate || 2048
  const downlinkRate = comms.downlinkRate || 8192
  const packetLoss = comms.packetLoss || 0.2
  const groundStation = comms.groundStation || "Goldstone"
  const nextAOS = comms.nextAOS || "00:15:32"
  
  // Signal strength status
  const getSignalStatus = (dbm) => {
    if (dbm > -70) return "nominal"
    if (dbm > -90) return "warning"
    return "critical"
  }

  const signalStatus = getSignalStatus(signalStrength)

  return (
    <StaticPanel
      id="comms-panel"
      title="📡 Communications"
      minHeight={360}
    >
      {/* Signal Strength */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Signal Strength
          </div>
          <Signal className={`w-4 h-4 ${signalStatus === "nominal" ? "text-green-500" : signalStatus === "warning" ? "text-yellow-500" : "text-red-500"}`} />
        </div>
        <div className="p-3 bg-muted/30 rounded border border-border text-center">
          <div className={`text-2xl font-mono font-bold ${signalStatus === "nominal" ? "text-green-500" : signalStatus === "warning" ? "text-yellow-500" : "text-red-500"}`}>
            {signalStrength.toFixed(1)} dBm
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {signalStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Data Rates */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Data Rates
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/30 rounded border border-border">
            <div className="text-[10px] text-muted-foreground mb-1">UPLINK</div>
            <div className="text-xs font-mono font-semibold">
              {(uplinkRate / 1024).toFixed(1)} kbps
            </div>
          </div>
          <div className="p-2 bg-muted/30 rounded border border-border">
            <div className="text-[10px] text-muted-foreground mb-1">DOWNLINK</div>
            <div className="text-xs font-mono font-semibold">
              {(downlinkRate / 1024).toFixed(1)} kbps
            </div>
          </div>
        </div>
        <DataRow 
          label="Packet Loss" 
          value={packetLoss.toFixed(2)} 
          unit="%" 
          status={packetLoss > 1 ? "warning" : "nominal"}
        />
      </div>

      {/* Ground Station */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Ground Station
        </div>
        <div className="p-2 bg-muted/30 rounded border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StatusGlyph status="nominal" size="sm" pulse />
              <span className="text-xs font-semibold">{groundStation}</span>
            </div>
            <span className="text-[10px] text-green-500 font-mono font-semibold">ACTIVE</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Next AOS: <span className="font-mono font-semibold text-foreground">{nextAOS}</span>
          </div>
        </div>
      </div>

      {/* Antenna Status */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
          <div className="flex items-center gap-2">
            <StatusGlyph status="nominal" size="sm" />
            <span className="text-xs text-muted-foreground">Antenna</span>
          </div>
          <span className="text-xs font-mono font-semibold text-green-500">TRACKING</span>
        </div>
      </div>
    </StaticPanel>
  )
}

export default CommsPanel
