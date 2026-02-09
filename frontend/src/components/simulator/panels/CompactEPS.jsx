/**
 * CompactEPS - Flat EPS display for mission control
 * No wrapping, all data visible
 */

export function CompactEPS({ telemetry }) {
  const power = telemetry?.subsystems?.power || {}
  const battery = power.batterySoc || 95
  const solar = power.solarArrayOutput || 1800
  const solarArrays = [
    { id: 1, output: 450 }, { id: 2, output: 450 },
    { id: 3, output: 450 }, { id: 4, output: 450 }
  ]

  return (
    <div className="space-y-1 text-xs">
      {/* Header */}
      <div className="font-bold text-yellow-400 border-b border-yellow-900/50 pb-1">
        ⚡ ELECTRICAL POWER
      </div>
      
      {/* Battery SOC */}
      <div className="py-1">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">Battery SOC</span>
          <span className="font-mono text-green-400 font-bold">{battery}%</span>
        </div>
        <div className="w-full bg-muted/30 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all" 
            style={{ width: `${battery}%` }}
          />
        </div>
      </div>
      
      {/* Battery Details */}
      <div className="grid grid-cols-3 gap-1 py-1 border-t border-border/30">
        <div><span className="text-muted-foreground">Voltage:</span> <span className="font-mono">28.50 V</span></div>
        <div><span className="text-muted-foreground">Current:</span> <span className="font-mono">2.50 A</span></div>
        <div><span className="text-muted-foreground">Temp:</span> <span className="font-mono">20.0°C</span></div>
      </div>
      
      {/* Solar Arrays */}
      <div className="py-1 border-t border-border/30">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">Solar Arrays</span>
          <span className="font-mono text-yellow-400">☀️ {solar}W</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {solarArrays.map((sa) => (
            <div key={sa.id} className="flex justify-between">
              <span className="text-muted-foreground">SA{sa.id}:</span>
              <span className="font-mono text-green-400">{sa.output} W</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Charge Rate */}
      <div className="py-1 border-t border-border/30">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Charge Rate:</span>
          <span className="font-mono text-green-400">71.3 W</span>
        </div>
      </div>
    </div>
  )
}
