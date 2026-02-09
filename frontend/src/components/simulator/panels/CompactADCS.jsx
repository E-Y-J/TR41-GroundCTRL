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
      {/* Header - Professional subdued colors */}
      <div className="font-mono text-[10px] text-slate-400 border-b border-slate-700/50 pb-1 flex items-center gap-2">
        <span className="text-cyan-400/80">◉</span>
        <span>ADCS</span>
      </div>
      
      {/* Attitude */}
      <div className="grid grid-cols-3 gap-1 py-1">
        <div><span className="text-slate-500">Roll:</span> <span className="font-mono text-slate-300">{attitude.roll?.toFixed(2) || "0.00"}°</span></div>
        <div><span className="text-slate-500">Pitch:</span> <span className="font-mono text-slate-300">{attitude.pitch?.toFixed(2) || "0.00"}°</span></div>
        <div><span className="text-slate-500">Yaw:</span> <span className="font-mono text-slate-300">{attitude.yaw?.toFixed(2) || "0.00"}°</span></div>
      </div>
      
      {/* Angular Rates */}
      <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-800/50">
        <div><span className="text-slate-500">X:</span> <span className="font-mono text-slate-300">{rates.x?.toFixed(3) || "0.000"}°/s</span></div>
        <div><span className="text-slate-500">Y:</span> <span className="font-mono text-slate-300">{rates.y?.toFixed(3) || "0.000"}°/s</span></div>
        <div><span className="text-slate-500">Z:</span> <span className="font-mono text-slate-300">{rates.z?.toFixed(3) || "0.000"}°/s</span></div>
      </div>
      
      {/* Reaction Wheels */}
      <div className="grid grid-cols-2 gap-1 py-1 border-t border-slate-800/50">
        {wheels.map((w) => (
          <div key={w.id} className="flex justify-between bg-slate-900/30 px-1.5 py-1 rounded">
            <span className="text-slate-500">RW{w.id}</span>
            <span className="font-mono text-cyan-400/90">{w.speed?.toFixed(0) || "0"} RPM</span>
          </div>
        ))}
      </div>
    </div>
  )
}
