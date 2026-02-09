/**
 * CompactADCS - Flat ADCS display for mission control
 * No wrapping, all data visible
 */

export function CompactADCS({ telemetry }) {
  const adcs = telemetry?.subsystems?.adcs || {}
  const attitude = adcs.attitude || { roll: 0, pitch: 0, yaw: 0 }
  const rates = adcs.angularRates || { x: 0, y: 0, z: 0 }
  const wheels = adcs.reactionWheels || [
    { id: 1, speed: 0 }, { id: 2, speed: 0 }, 
    { id: 3, speed: 0 }, { id: 4, speed: 0 }
  ]

  return (
    <div className="space-y-1 text-xs">
      {/* Header */}
      <div className="font-bold text-blue-400 border-b border-blue-900/50 pb-1">
        🧭 ATTITUDE CONTROL
      </div>
      
      {/* Attitude */}
      <div className="grid grid-cols-3 gap-1 py-1">
        <div><span className="text-muted-foreground">Roll:</span> <span className="font-mono">{attitude.roll?.toFixed(2) || "0.00"}°</span></div>
        <div><span className="text-muted-foreground">Pitch:</span> <span className="font-mono">{attitude.pitch?.toFixed(2) || "0.00"}°</span></div>
        <div><span className="text-muted-foreground">Yaw:</span> <span className="font-mono">{attitude.yaw?.toFixed(2) || "0.00"}°</span></div>
      </div>
      
      {/* Angular Rates */}
      <div className="grid grid-cols-3 gap-1 py-1 border-t border-border/30">
        <div><span className="text-muted-foreground">X:</span> <span className="font-mono">{rates.x?.toFixed(3) || "0.000"}°/s</span></div>
        <div><span className="text-muted-foreground">Y:</span> <span className="font-mono">{rates.y?.toFixed(3) || "0.000"}°/s</span></div>
        <div><span className="text-muted-foreground">Z:</span> <span className="font-mono">{rates.z?.toFixed(3) || "0.000"}°/s</span></div>
      </div>
      
      {/* Reaction Wheels */}
      <div className="grid grid-cols-2 gap-1 py-1 border-t border-border/30">
        {wheels.map((w) => (
          <div key={w.id} className="flex justify-between">
            <span className="text-muted-foreground">RW{w.id}:</span>
            <span className="font-mono text-green-400">{w.speed?.toFixed(0) || "0"} RPM</span>
          </div>
        ))}
      </div>
    </div>
  )
}
