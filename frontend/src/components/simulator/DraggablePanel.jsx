/**
 * DraggablePanel - Reusable draggable/resizable panel component
 * 
 * Provides a draggable, resizable panel with persistence to localStorage.
 * Used as the base for all floating mission control panels.
 */

import { useState, useEffect, useCallback } from "react"
import { Rnd } from "react-rnd"
import { GripVertical, Minimize2, Maximize2, X } from "lucide-react"

export function DraggablePanel({
  id,
  title,
  children,
  defaultPosition = { x: 100, y: 100, width: 400, height: 300 },
  minWidth = 300,
  minHeight = 200,
  maxWidth,
  maxHeight,
  onClose,
  showClose = true,
  showMinimize = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
  dragHandleClassName = "drag-handle",
}) {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(`panel-position-${id}`)
      return saved ? JSON.parse(saved) : defaultPosition
    } catch (error) {
      console.warn(`[DraggablePanel] Failed to load position for ${id}:`, error)
      return defaultPosition
    }
  })

  const [isMinimized, setIsMinimized] = useState(false)
  const [preMinimizeHeight, setPreMinimizeHeight] = useState(defaultPosition.height)

  // Save position to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`panel-position-${id}`, JSON.stringify(position))
    } catch (error) {
      console.warn(`[DraggablePanel] Failed to save position for ${id}:`, error)
    }
  }, [id, position])

  // Handle minimize/maximize
  const handleMinimize = useCallback(() => {
    if (!isMinimized) {
      setPreMinimizeHeight(position.height)
      setPosition(prev => ({ ...prev, height: 40 }))
    } else {
      setPosition(prev => ({ ...prev, height: preMinimizeHeight }))
    }
    setIsMinimized(!isMinimized)
  }, [isMinimized, position.height, preMinimizeHeight])

  // Handle close
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  return (
    <Rnd
      position={{ x: position.x, y: position.y }}
      size={{ width: position.width, height: position.height }}
      onDragStop={(e, d) => {
        setPosition(prev => ({ ...prev, x: d.x, y: d.y }))
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        setPosition({
          x: newPosition.x,
          y: newPosition.y,
          width: ref.style.width,
          height: ref.style.height,
        })
      }}
      minWidth={minWidth}
      minHeight={isMinimized ? 40 : minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      bounds="parent"
      dragHandleClassName={dragHandleClassName}
      className={`bg-card border border-border rounded-lg shadow-xl ${className}`}
      enableResizing={!isMinimized}
      style={{ zIndex: 50 }}
    >
      {/* Header with drag handle */}
      <div
        className={`${dragHandleClassName} cursor-move p-2 border-b border-border bg-muted/30 flex items-center justify-between rounded-t-lg ${headerClassName}`}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
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
          {showClose && onClose && (
            <button
              onClick={handleClose}
              className="hover:bg-destructive/20 hover:text-destructive p-1 rounded transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content (hidden when minimized) */}
      {!isMinimized && (
        <div className={`p-4 overflow-auto h-[calc(100%-40px)] ${contentClassName}`}>
          {children}
        </div>
      )}
    </Rnd>
  )
}

export default DraggablePanel
