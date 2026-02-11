/**
 * Flight Director Strip - GO / NO-GO Status Bar
 * 
 * This is the top-level command view - exactly how real flight directors scan system health.
 * One glance = mission state
 * 
 * Procedurally renders from hudConfig.flightDirectorStrip
 * Maps telemetry → GO / NO-GO status per subsystem
 */

import { hudConfig } from "@/config/hudConfig";

export default function FlightDirectorStrip({ config, status }) {
  // Use provided config or fall back to hudConfig
  const stripConfig = config || hudConfig.flightDirectorStrip;
  
  return (
    <div className="fd-strip flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-2">
        Flight Director
      </div>
      {stripConfig.map(item => {
        const itemStatus = status[item.key] || "UNKNOWN";
        
        return (
          <div
            key={item.key}
            className={`fd-item flex items-center gap-2 px-3 py-1 rounded border ${getStatusStyles(itemStatus).border} ${getStatusStyles(itemStatus).bg}`}
          >
            <span className="fd-label text-xs font-semibold text-foreground uppercase">
              {item.label}
            </span>
            <span className={`fd-value text-xs font-bold ${getStatusStyles(itemStatus).text}`}>
              {itemStatus}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Get status-specific styling
 * GO = nominal/operational
 * NO-GO = degraded/failed
 * HOLD = standby/waiting
 */
function getStatusStyles(status) {
  const normalizedStatus = status.toUpperCase();
  
  if (normalizedStatus === "GO" || normalizedStatus === "NOMINAL") {
    return {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/30'
    };
  }
  
  if (normalizedStatus === "NO-GO" || normalizedStatus === "CRITICAL" || normalizedStatus === "FAILED") {
    return {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/30'
    };
  }
  
  if (normalizedStatus === "HOLD" || normalizedStatus === "STANDBY" || normalizedStatus === "CAUTION") {
    return {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
      border: 'border-yellow-500/30'
    };
  }
  
  // Unknown/default
  return {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border'
  };
}
