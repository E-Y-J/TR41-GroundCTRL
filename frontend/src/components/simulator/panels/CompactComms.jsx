/**
 * CompactComms - Flat Communications display for mission control
 * No wrapping, all data visible
 */

export function CompactComms({ telemetry }) {
  const comms = telemetry?.communications || {}
  const signalStrength = comms.signalStrength || -85
  const groundStation = comms.groundStation || 'Goldstone'
  const uplink = 2.0
  const downlink = 8.0
  const packetLoss = 0.20

  return (
    <div className="space-y-1 text-xs">
      {/* Header - Professional subdued colors */}
      <div className="font-mono text-[10px] text-slate-400 border-b border-slate-700/50 pb-1 flex items-center gap-2">
        <span className="text-sky-400/80">◉</span>
        <span>COMMS</span>
      </div>
      
      {/* Signal Strength */}
      <div className="py-1">
        <div className="flex justify-between mb-1">
          <span className="text-slate-500">Signal Strength</span>
          <span className="font-mono text-amber-400/90 font-bold">{signalStrength} dBm</span>
        </div>
        <div className="text-[10px] text-amber-500/80">MARGINAL</div>
      </div>
      
      {/* Data Rates */}
      <div className="grid grid-cols-2 gap-2 py-1 border-t border-slate-800/50">
        <div className="bg-slate-900/30 p-1.5 rounded border border-slate-800/50">
          <div className="text-slate-500 mb-0.5 text-[10px]">↑ UPLINK</div>
          <div className="font-mono text-sky-400/90">{uplink} kbps</div>
        </div>
        <div className="bg-slate-900/30 p-1.5 rounded border border-slate-800/50">
          <div className="text-slate-500 mb-0.5 text-[10px]">↓ DOWNLINK</div>
          <div className="font-mono text-emerald-400/90">{downlink} kbps</div>
        </div>
      </div>
      
      {/* Packet Loss */}
      <div className="py-1 border-t border-slate-800/50">
        <div className="flex justify-between">
          <span className="text-slate-500">Packet Loss</span>
          <span className="font-mono text-slate-300">{packetLoss}%</span>
        </div>
      </div>
      
      {/* Ground Station */}
      <div className="py-1 border-t border-slate-800/50">
        <div className="text-slate-500 text-[10px] mb-1">GROUND STATION</div>
        <div className="flex items-center justify-between bg-slate-900/30 p-1.5 rounded border border-slate-800/50">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-mono text-slate-300">{groundStation}</span>
          </div>
          <span className="text-[9px] text-emerald-400/90">LOCK</span>
        </div>
        <div className="text-[10px] text-slate-600 mt-1">
          Next AOS: 08:15:32
        </div>
      </div>
      
      {/* Antenna Status */}
      <div className="py-1 border-t border-slate-800/50">
        <div className="flex justify-between">
          <span className="text-slate-500">Antenna</span>
          <span className="font-mono text-sky-400/90">TRACK</span>
        </div>
      </div>
    </div>
  )
}
