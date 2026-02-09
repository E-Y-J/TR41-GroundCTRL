/**
 * StaticPanel - Non-draggable panel component for fixed mission control layout
 * 
 * Used for permanently docked panels in NASA/Starlink-style layouts.
 * Provides consistent styling without drag/resize functionality.
 */

import { useState, useCallback } from "react"
import { GripVertical, Minimize2, Maximize2 } from "lucide-react"

export function StaticPanel({
  id,
  title,
  children,
  minHeight = 200,
  maxHeight,
  className = "",
  headerClassName = "",
  contentClassName = "",
  showMinimize = true,
  defaultMinimized = false,
}) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized)

  // Handle minimize/maximize
  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
  }, [isMinimized])

  return (
    <div 
      className={`bg-card border border-border rounded-lg shadow-md w-full flex flex-col ${className}`}
      style={{ 
        minHeight: isMinimized ? '40px' : `${minHeight}px`,
        maxHeight: isMinimized ? '40px' : maxHeight ? `${maxHeight}px` : undefined
      }}
    >
      {/* Header */}
      <div
        className={`p-2 border-b border-border bg-muted/30 flex items-center justify-between rounded-t-lg ${headerClassName}`}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-600 text-white font-bold">
            ACTIVE
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {showMinimize && (
            <button
              onClick={handleMinimize}
              className="hover:bg-muted p-1 rounded transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content (hidden when minimized) */}
      {!isMinimized && (
        <div className={`p-3 overflow-y-auto flex-1 ${contentClassName}`} style={{ maxHeight: maxHeight ? `${maxHeight - 48}px` : undefined }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default StaticPanel
