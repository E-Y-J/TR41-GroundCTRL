/**
 * SubsystemCard - Modular draggable console panel for subsystem monitoring
 * 
 * Provides a status-aware draggable panel for specific spacecraft subsystems.
 * Status is indicated by colored border (nominal/warning/critical).
 */

import { useMemo } from "react"
import { DraggablePanel } from "./DraggablePanel"
import { AlertCircle } from "lucide-react"

// Status configuration with colors matching mission control systems
const STATUS_CONFIG = {
  nominal: {
    borderColor: "border-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    label: "NOMINAL",
  },
  warning: {
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    label: "WARNING",
  },
  critical: {
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    label: "CRITICAL",
  },
  offline: {
    borderColor: "border-gray-500",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-500",
    label: "OFFLINE",
  },
}

export function SubsystemCard({
  subsystem,
  title,
  icon: Icon,
  telemetry,
  status = "nominal",
  alarmCount = 0,
  onCommand,
  defaultPosition,
  children,
  onClose,
}) {
  const statusConfig = useMemo(() => STATUS_CONFIG[status] || STATUS_CONFIG.nominal, [status])

  return (
    <DraggablePanel
      id={`subsystem-${subsystem.toLowerCase()}`}
      title={title}
      defaultPosition={defaultPosition}
      minWidth={280}
      minHeight={200}
      onClose={onClose}
      className={`${statusConfig.borderColor} border-2`}
      headerClassName={statusConfig.bgColor}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${statusConfig.textColor}`} />}
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {subsystem}
            </div>
            <div className={`text-xs font-mono font-semibold ${statusConfig.textColor}`}>
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Alarm Badge */}
        {alarmCount > 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs font-mono font-bold">{alarmCount}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {children}
      </div>
    </DraggablePanel>
  )
}

/**
 * DataRow - Reusable telemetry data row component
 */
export function DataRow({ label, value, unit, status = "nominal" }) {
  const statusColors = {
    nominal: "text-foreground",
    warning: "text-yellow-500",
    critical: "text-red-500",
  }

  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold ${statusColors[status]}`}>
        {value}
        {unit && <span className="text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  )
}

/**
 * StatusBar - Visual progress/level indicator
 */
export function StatusBar({ label, value, max = 100, status = "nominal", showPercentage = true }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const statusColors = {
    nominal: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{label}</span>
        {showPercentage && (
          <span className={`font-mono font-semibold ${statusColors[status].replace('bg-', 'text-')}`}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * StatusGlyph - Colored indicator dot
 */
export function StatusGlyph({ status = "nominal", size = "sm", pulse = false }) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const statusColors = {
    nominal: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
    offline: "bg-gray-500",
  }

  return (
    <div
      className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ${
        pulse && status !== "nominal" ? "animate-pulse" : ""
      }`}
    />
  )
}

export default SubsystemCard
