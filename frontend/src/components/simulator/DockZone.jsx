/**
 * DockZone - Visual docking zone for panels
 * 
 * Renders a highlighted zone when panels are dragged nearby.
 * Shows where the panel will snap when dropped.
 */

import { useDocking } from '@/contexts/DockingContext'
import { cn } from '@/lib/utils'

export function DockZone({ zoneId, className = '' }) {
  const { getDockZone, highlightedZone, getZonePanels } = useDocking()
  
  const zone = getDockZone(zoneId)
  const isHighlighted = highlightedZone === zoneId
  const zonePanels = getZonePanels(zoneId)
  const isFull = zonePanels.length >= zone.maxPanels
  
  if (!zone) return null
  
  // Calculate position styles
  const getPositionStyles = () => {
    const styles = {
      position: 'absolute',
      pointerEvents: isHighlighted ? 'auto' : 'none',
      transition: 'all 0.2s ease-in-out',
      zIndex: isHighlighted ? 100 : 0
    }
    
    // Handle x position
    if (typeof zone.position.x === 'number') {
      styles.left = `${zone.position.x}px`
    } else {
      styles.left = zone.position.x
    }
    
    // Handle y position
    if (typeof zone.position.y === 'number') {
      styles.top = `${zone.position.y}px`
    } else {
      styles.top = zone.position.y
    }
    
    // Handle width
    if (typeof zone.size.width === 'number') {
      styles.width = `${zone.size.width}px`
    } else {
      styles.width = zone.size.width
    }
    
    // Handle height
    if (typeof zone.size.maxHeight === 'number') {
      styles.height = `${zone.size.maxHeight}px`
    } else {
      styles.height = zone.size.maxHeight
    }
    
    return styles
  }
  
  return (
    <div
      data-dock-zone={zoneId}
      style={getPositionStyles()}
      className={cn(
        'rounded-lg border-2 border-dashed transition-all duration-200',
        isHighlighted && !isFull && 'border-blue-500 bg-blue-500/10 backdrop-blur-sm shadow-lg shadow-blue-500/50',
        isHighlighted && isFull && 'border-red-500 bg-red-500/10',
        !isHighlighted && 'border-transparent',
        className
      )}
    >
      {/* Zone label (only shown when highlighted) */}
      {isHighlighted && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-lg flex items-center gap-2">
          <span>{zone.label}</span>
          {isFull && (
            <span className="bg-red-500 px-1.5 py-0.5 rounded text-[10px]">FULL</span>
          )}
          {!isFull && (
            <span className="text-[10px] opacity-75">
              {zonePanels.length}/{zone.maxPanels}
            </span>
          )}
        </div>
      )}
      
      {/* Snap preview ghost panels */}
      {isHighlighted && !isFull && (
        <div className="absolute inset-0 p-2">
          {zone.orientation === 'vertical' ? (
            // Vertical stack preview
            <div className="flex flex-col gap-1 h-full">
              {[...Array(zonePanels.length + 1)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 border-2 border-dashed rounded',
                    i === zonePanels.length 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-blue-300/50 bg-blue-300/10'
                  )}
                />
              ))}
            </div>
          ) : (
            // Horizontal stack preview
            <div className="flex gap-1 h-full">
              {[...Array(zonePanels.length + 1)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 border-2 border-dashed rounded',
                    i === zonePanels.length 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-blue-300/50 bg-blue-300/10'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * DockZones - Renders all dock zones
 */
export function DockZones() {
  const { zones } = useDocking()
  
  return (
    <>
      {Object.keys(zones).map((zoneId) => (
        <DockZone key={zoneId} zoneId={zoneId} />
      ))}
    </>
  )
}

export default DockZone
