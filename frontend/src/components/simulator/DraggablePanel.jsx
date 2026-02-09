/**
 * DraggablePanel - Reusable draggable/resizable panel component
 * 
 * Provides a draggable, resizable panel with persistence to localStorage.
 * Used as the base for all floating mission control panels.
 * 
 * Phase 1.5: Now with magnetic docking to zones!
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { Rnd } from "react-rnd"
import { GripVertical, Minimize2, Maximize2, X, Pin, PinOff } from "lucide-react"
import { useDocking } from "@/contexts/DockingContext"

// Footer height to exclude from draggable area
// Increased to ensure panels cannot overlap footer controls
const FOOTER_HEIGHT = 80

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
  enableDocking = true,
  dockType = "info", // for filtering which zones this panel can dock to
  className = "",
  headerClassName = "",
  contentClassName = "",
  dragHandleClassName = "drag-handle",
}) {
  const docking = enableDocking ? useDocking() : null
  
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
  const [isDragging, setIsDragging] = useState(false)
  
  // Check if this panel is docked
  const dockedZone = docking ? docking.isPanelDocked(id) : null
  
  // Calculate bounds to exclude footer area
  // Recalculates whenever position/size changes to ensure footer stays protected
  const dragBounds = useMemo(() => {
    const panelWidth = position.width || defaultPosition.width
    const panelHeight = isMinimized ? 40 : (position.height || defaultPosition.height)
    
    return {
      left: 0,
      top: 0,
      right: Math.max(0, window.innerWidth - panelWidth),
      bottom: Math.max(0, window.innerHeight - FOOTER_HEIGHT - panelHeight)
    }
  }, [position.width, position.height, defaultPosition.width, defaultPosition.height, isMinimized])

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

  // Handle drag start
  const handleDragStart = useCallback((e, d) => {
    setIsDragging(true)
    // If panel was docked, undock it and set its position to where it currently is visually
    if (docking && dockedZone) {
      // Get the current visual position from the drag event
      const currentPosition = {
        x: d.x,
        y: d.y,
        width: position.width,
        height: position.height
      }
      console.log('[DraggablePanel] Undocking from drag start, current pos:', currentPosition)
      docking.undockPanel(id, currentPosition)
      // Update local position state to match
      setPosition(currentPosition)
    }
  }, [docking, dockedZone, id, position])

  // Handle dragging (detect nearby zones)
  const handleDrag = useCallback((e, d) => {
    if (!docking) return
    
    const nearZone = docking.detectDockZone({ x: d.x, y: d.y })
    if (nearZone !== docking.highlightedZone) {
      docking.setHighlightedZone(nearZone)
    }
  }, [docking])

  // Handle drag stop (snap to zone if near one)
  const handleDragStop = useCallback((e, d) => {
    setIsDragging(false)
    
    if (docking) {
      const nearZone = docking.detectDockZone({ x: d.x, y: d.y })
      docking.setHighlightedZone(null)
      
      if (nearZone) {
        // Attempt to dock
        const success = docking.dockPanel(id, nearZone, { dockType })
        if (success) {
          // Calculate and apply dock position
          const dockPos = docking.calculateDockPosition(nearZone, id)
          if (dockPos) {
            setPosition({
              x: dockPos.x,
              y: dockPos.y,
              width: dockPos.width,
              height: dockPos.height
            })
            return
          }
        }
      }
    }
    
    // Normal position update (not docking)
    setPosition(prev => ({ ...prev, x: d.x, y: d.y }))
  }, [docking, id, dockType])

  // Handle manual dock toggle
  const handleDockToggle = useCallback(() => {
    if (!docking) return
    
    if (dockedZone) {
      // Undock
      docking.undockPanel(id, position)
    } else {
      // Try to dock to nearest zone
      const nearZone = docking.detectDockZone(position)
      if (nearZone) {
        docking.dockPanel(id, nearZone, { dockType })
        const dockPos = docking.calculateDockPosition(nearZone, id)
        if (dockPos) {
          setPosition({
            x: dockPos.x,
            y: dockPos.y,
            width: dockPos.width,
            height: dockPos.height
          })
        }
      }
    }
  }, [docking, dockedZone, id, position, dockType])

  // Render inline when docked (use portal to teleport into dock container)
  if (dockedZone) {
    const portalTargetId = `dock-${dockedZone}-portal`
    const portalTarget = document.getElementById(portalTargetId)
    
    const dockedContent = (
      <div className={`bg-card border border-border rounded-lg shadow-md w-full ${className}`}>
        {/* Header with drag handle */}
        <div
          className={`p-2 border-b border-border bg-muted/30 flex items-center justify-between rounded-t-lg ${headerClassName}`}
          onDoubleClick={handleDockToggle}
          title="Double-click to undock"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
              DOCKED
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {enableDocking && docking && (
              <button
                onClick={handleDockToggle}
                className="hover:bg-muted p-1 rounded transition-colors"
                title="Undock panel"
              >
                <PinOff className="w-3.5 h-3.5 text-blue-500 hover:text-blue-600" />
              </button>
            )}
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
          <div className={`p-4 ${contentClassName}`}>
            {children}
          </div>
        )}
      </div>
    )
    
    // Use portal if target exists, otherwise render normally
    return portalTarget ? createPortal(dockedContent, portalTarget) : dockedContent
  }
  
  // Render with react-rnd when floating
  return (
    <Rnd
      position={{ x: position.x, y: position.y }}
      size={{ width: position.width, height: position.height }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
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
      bounds={dragBounds}
      dragHandleClassName={dragHandleClassName}
      className={`bg-card border border-border rounded-lg shadow-xl ${className}`}
      enableResizing={!isMinimized}
      style={{ zIndex: isDragging ? 100 : 50 }}
    >
      {/* Header with drag handle */}
      <div
        className={`${dragHandleClassName} cursor-move p-2 border-b border-border bg-muted/30 flex items-center justify-between rounded-t-lg ${headerClassName}`}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
          {dockedZone && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
              DOCKED
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {enableDocking && docking && (
            <button
              onClick={handleDockToggle}
              className="hover:bg-muted p-1 rounded transition-colors"
              title={dockedZone ? "Undock panel" : "Dock panel"}
            >
              {dockedZone ? (
                <PinOff className="w-3.5 h-3.5 text-blue-500 hover:text-blue-600" />
              ) : (
                <Pin className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          )}
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
