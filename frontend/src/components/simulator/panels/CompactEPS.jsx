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
      {/* Header - Professional subdued colors */}
      <div className="font-mono text-[10px] text-slate-400 border-b border-slate-700/50 pb-1 flex items-center gap-2">
        <span className="text-amber-400/80">⚡</span>
        <span>POWER</span>
      </div>
      
      {/* Battery SOC */}
      <div className="py-1">
        <div className="flex justify-between mb-1">
          <span className="text-slate-500">Battery SOC</span>
          <span className="font-mono text-emerald-400/90 font-bold">{battery}%</span>
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-1.5">
          <div 
            className="bg-emerald-500/80 h-1.5 rounded-full transition-all" 
            style={{ width: `${battery}%` }}
          />
        </div>
      </div>
      
      {/* Battery Details */}
      <div className="grid grid-cols-3 gap-1 py-1 border-t border-slate-800/50">
        <div><span className="text-slate-500">V:</span> <span className="font-mono text-slate-300">28.50</span></div>
        <div><span className="text-slate-500">A:</span> <span className="font-mono text-slate-300">2.50</span></div>
        <div><span className="text-slate-500">T:</span> <span className="font-mono text-slate-300">20.0°C</span></div>
      </div>
      
      {/* Solar Arrays */}
      <div className="py-1 border-t border-slate-800/50">
        <div className="flex justify-between mb-1">
          <span className="text-slate-500">Solar Arrays</span>
          <span className="font-mono text-amber-400/90">{solar}W</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {solarArrays.map((sa) => (
            <div key={sa.id} className="flex justify-between bg-slate-900/30 px-1.5 py-1 rounded">
              <span className="text-slate-500">SA{sa.id}</span>
              <span className="font-mono text-emerald-400/90">{sa.output}W</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Charge Rate */}
      <div className="py-1 border-t border-slate-800/50">
        <div className="flex justify-between">
          <span className="text-slate-500">Charge Rate</span>
          <span className="font-mono text-emerald-400/90">+71.3 W</span>
        </div>
      </div>
    </div>
  )
}
