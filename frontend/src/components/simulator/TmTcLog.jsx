/**
 * TM/TC Log - NASA-Style Telemetry/Command Log with Severity Filtering
 * 
 * Features:
 * - NASA severity filtering: INFO+, CAUTION+, WARNING+, CRITICAL
 * - Standardized TM/TC event format
 * - Real-time stream from telemetry and commands
 * 
 * Event Format:
 * {
 *   time: "18:42:11",
 *   type: "TM" | "TC",
 *   subsystem: "ADCS",
 *   severity: "INFO" | "CAUTION" | "WARNING" | "CRITICAL",
 *   message: "Rate error exceeded threshold"
 * }
 */

import { useState } from "react";

export default function TmTcLog({ entries }) {
  const [severityFilter, setSeverityFilter] = useState("INFO");
  
  // Severity priority mapping for filtering
  const severityPriority = {
    "INFO": 0,
    "CAUTION": 1,
    "WARNING": 2,
    "CRITICAL": 3
  };
  
  // Filter entries by severity level (show selected level and above)
  const filtered = entries.filter(e => 
    severityPriority[e.severity] >= severityPriority[severityFilter]
  );
  
  return (
    <div className="tm-tc-log flex flex-col h-full bg-card border border-border rounded-lg">
      {/* Controls */}
      <div className="tm-tc-controls flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        {["INFO", "CAUTION", "WARNING", "CRITICAL"].map(level => (
          <button
            key={level}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              severityFilter === level
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setSeverityFilter(level)}
          >
            {level}+
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} / {entries.length} events
        </div>
      </div>
      
      {/* Log Body */}
      <div className="tm-tc-log__body flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No events match filter
          </div>
        ) : (
          filtered.map((e, i) => (
            <div
              key={i}
              className={`log-row flex items-start gap-2 p-2 rounded ${getTypeStyles(e.type)} ${getSeverityStyles(e.severity)}`}
            >
              <span className="text-muted-foreground shrink-0 w-16">{e.time}</span>
              <span className={`font-bold shrink-0 w-8 ${e.type === 'TC' ? 'text-blue-400' : 'text-green-400'}`}>
                {e.type}
              </span>
              <span className="text-foreground/70 shrink-0 w-16 uppercase">
                {e.subsystem}
              </span>
              <span className="text-foreground flex-1">
                {e.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Get type-specific styling (TM vs TC)
 */
function getTypeStyles(type) {
  return type === 'TC' ? 'bg-blue-500/5' : 'bg-green-500/5';
}

/**
 * Get severity-specific styling
 */
function getSeverityStyles(severity) {
  switch (severity) {
    case 'CRITICAL':
      return 'border-l-2 border-l-red-500';
    case 'WARNING':
      return 'border-l-2 border-l-orange-500';
    case 'CAUTION':
      return 'border-l-2 border-l-yellow-500';
    case 'INFO':
    default:
      return 'border-l-2 border-l-blue-500';
  }
}
