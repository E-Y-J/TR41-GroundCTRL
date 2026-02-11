/**
 * EPSPanel - Electrical Power System Panel
 * 
 * Displays battery SOC, solar array output, power budget, and load distribution.
 * Part of the modular mission control console system.
 */

import { StaticPanel } from "../StaticPanel"
import { DataRow, StatusBar, StatusGlyph } from "../SubsystemCard"
import { Battery, Sun } from "lucide-react"

export function EPSPanel({ telemetry, status = "nominal" }) {
  // Extract EPS telemetry
  const power = telemetry?.subsystems?.power || {}
  const batterySoc = power.batterySoc || 95
  const solarArrayOutput = power.solarArrayOutput || 1800
  const batteryVoltage = power.batteryVoltage || 28.5
  const batteryCurrent = power.batteryCurrent || 2.5
  const batteryTemp = power.batteryTemp || 20
  const solarPanels = power.solarPanels || [
    { id: 1, output: 450, status: "nominal" },
    { id: 2, output: 450, status: "nominal" },
    { id: 3, output: 450, status: "nominal" },
    { id: 4, output: 450, status: "nominal" },
  ]

  // Determine battery status
  const getBatteryStatus = (soc) => {
    if (soc < 20) return "critical"
    if (soc < 40) return "warning"
    return "nominal"
  }

  const batteryStatus = getBatteryStatus(batterySoc)

  return (
    <StaticPanel
      id="eps-panel"
      title="⚡ Electrical Power"
      minHeight={420}
    >
      {/* Battery Status */}
      <div className="space-y-2">
        <StatusBar
          label="Battery SOC"
          value={batterySoc}
          max={100}
          status={batteryStatus}
          showPercentage
        />
      </div>

      {/* Battery Details */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Battery
        </div>
        <DataRow label="Voltage" value={batteryVoltage.toFixed(2)} unit="V" />
        <DataRow label="Current" value={batteryCurrent.toFixed(2)} unit="A" />
        <DataRow label="Temperature" value={batteryTemp.toFixed(1)} unit="°C" />
        <DataRow 
          label="Charge Rate" 
          value={(batteryVoltage * batteryCurrent).toFixed(1)} 
          unit="W" 
        />
      </div>

      {/* Solar Arrays */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Solar Arrays
          </div>
          <div className="flex items-center gap-1">
            <Sun className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-mono font-semibold">
              {solarArrayOutput.toFixed(0)}W
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {solarPanels.map((panel) => (
            <div
              key={panel.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border"
            >
              <div className="flex items-center gap-2">
                <StatusGlyph status={panel.status || "nominal"} size="sm" />
                <span className="text-xs text-muted-foreground">SA{panel.id}</span>
              </div>
              <span className="text-xs font-mono font-semibold">
                {panel.output?.toFixed(0) || "0"}
                <span className="text-muted-foreground text-[10px] ml-1">W</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Power Budget */}
      <div className="pt-3 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Power Budget
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Generation</span>
            <span className="font-mono font-semibold text-green-500">
              +{solarArrayOutput.toFixed(0)}W
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Consumption</span>
            <span className="font-mono font-semibold text-red-500">
              -{(solarArrayOutput * 0.85).toFixed(0)}W
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-border">
            <span className="text-muted-foreground font-semibold">Net</span>
            <span className="font-mono font-semibold text-green-500">
              +{(solarArrayOutput * 0.15).toFixed(0)}W
            </span>
          </div>
        </div>
      </div>
    </StaticPanel>
  )
}

export default EPSPanel
