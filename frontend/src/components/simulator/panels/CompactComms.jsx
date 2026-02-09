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
      {/* Header */}
      <div className="font-bold text-green-400 border-b border-green-900/50 pb-1">
        📡 COMMUNICATIONS
      </div>
      
      {/* Signal Strength */}
      <div className="py-1">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">Signal Strength</span>
          <span className="font-mono text-yellow-400 font-bold">{signalStrength} dBm</span>
        </div>
        <div className="text-[10px] text-orange-400">WARNING</div>
      </div>
      
      {/* Data Rates */}
      <div className="grid grid-cols-2 gap-2 py-1 border-t border-border/30">
        <div className="bg-blue-950/30 p-1.5 rounded">
          <div className="text-muted-foreground mb-0.5">UPLINK</div>
          <div className="font-mono text-blue-400">{uplink} kbps</div>
        </div>
        <div className="bg-green-950/30 p-1.5 rounded">
          <div className="text-muted-foreground mb-0.5">DOWNLINK</div>
          <div className="font-mono text-green-400">{downlink} kbps</div>
        </div>
      </div>
      
      {/* Packet Loss */}
      <div className="py-1 border-t border-border/30">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Packet Loss</span>
          <span className="font-mono">{packetLoss} %</span>
        </div>
      </div>
      
      {/* Ground Station */}
      <div className="py-1 border-t border-border/30">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">GROUND STATION</span>
        </div>
        <div className="flex items-center justify-between mt-1 bg-green-950/30 p-1.5 rounded">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-mono text-green-400">{groundStation}</span>
          </div>
          <span className="text-[10px] text-green-400">ACTIVE</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">
          Next AOS: 08:15:32
        </div>
      </div>
      
      {/* Antenna Status */}
      <div className="py-1 border-t border-border/30">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Antenna</span>
          <span className="font-mono text-green-400">TRACKING</span>
        </div>
      </div>
    </div>
  )
}
