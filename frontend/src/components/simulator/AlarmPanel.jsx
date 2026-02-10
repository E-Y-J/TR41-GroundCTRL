/**
 * NASA-Style Alarm Panel - Latched Warnings/Alarms
 * 
 * Critical Feature: Alarms persist until acknowledged - even if telemetry recovers.
 * This is how real flight controllers trust latched alarms.
 * You never miss a transient fault.
 * 
 * Uses NASA severity levels: INFO, CAUTION, WARNING, CRITICAL
 * Separate from existing AlertPanel (parallel system)
 */


export default function AlarmPanel({ alarms, onAcknowledge }) {
  // Filter for latched and unacknowledged alarms only
  const activeAlarms = alarms.filter(a => a.latched && !a.acknowledged);
  
  if (activeAlarms.length === 0) {
    return null;
  }
  
  return (
    <div className="alarm-panel fixed top-20 left-4 w-96 max-h-96 overflow-y-auto bg-card border border-border rounded-lg shadow-xl z-50">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-muted/50">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
          ⚠️ Latched Alarms ({activeAlarms.length})
        </h3>
      </div>
      
      {/* Alarm List */}
      <div className="p-2 space-y-2">
        {activeAlarms.map(alarm => (
          <div
            key={alarm.id}
            className={`alarm p-3 rounded border ${getSeverityStyles(alarm.severity).border} ${getSeverityStyles(alarm.severity).bg}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${getSeverityStyles(alarm.severity).text}`}>
                    {alarm.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {alarm.subsystem}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  {alarm.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alarm.timestamp}
                </p>
              </div>
              <button
                onClick={() => onAcknowledge(alarm.id)}
                className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                ACK
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Get severity-specific styling
 * NASA severity levels: INFO → CAUTION → WARNING → CRITICAL
 */
function getSeverityStyles(severity) {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        border: 'border-red-500/50'
      };
    case 'WARNING':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        border: 'border-orange-500/50'
      };
    case 'CAUTION':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-500',
        border: 'border-yellow-500/50'
      };
    case 'INFO':
    default:
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/50'
      };
  }
}
