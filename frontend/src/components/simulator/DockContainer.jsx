/**
 * DockContainer - Visible background columns/rows for docking panels
 * 
 * These are the permanent visible containers that panels dock into.
 * Based on the wireframe design with left column, right column, top bar, bottom bar.
 */

import { useDocking } from '@/contexts/DockingContext'
import { cn } from '@/lib/utils'

/**
 * Left Column - for NOVA, ADCS, EPS panels
 */
export function LeftDockColumn({ children, dockedPanels = [] }) {
  const { highlightedZone } = useDocking()
  const isHighlighted = highlightedZone === 'left'
  
  return (
    <div 
      className={cn(
        "w-[320px] border-r border-border bg-card/30 backdrop-blur-sm flex flex-col gap-2 transition-all duration-200 relative",
        isHighlighted && "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
      )}
    >
      {/* Debug: Visual overlay for dockable zone */}
      <div className="absolute inset-0 pointer-events-none bg-green-500/10 border-2 border-green-500/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-500/50 border-2 border-green-500" />
        <span className="absolute top-2 left-2 text-xs font-mono text-green-500/80 bg-black/50 px-1 rounded">LEFT DOCK</span>
      </div>
      {/* Render children (like NOVA) */}
      {children}
      
      {/* Portal target for docked panels */}
      <div id="dock-left-portal" className="flex flex-col gap-2 shrink-0" />
    </div>
  )
}

/**
 * Right Column - for Command Console, TM/TC, Comms panels
 */
export function RightDockColumn({ children, dockedPanels = [] }) {
  const { highlightedZone } = useDocking()
  const isHighlighted = highlightedZone === 'right'
  
  return (
    <div 
      className={cn(
        "w-[320px] border-l border-border bg-card/30 backdrop-blur-sm flex flex-col gap-2 transition-all duration-200 relative",
        isHighlighted && "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
      )}
    >
      {/* Debug: Visual overlay for dockable zone */}
      <div className="absolute inset-0 pointer-events-none bg-purple-500/10 border-2 border-purple-500/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500/50 border-2 border-purple-500" />
        <span className="absolute top-2 right-2 text-xs font-mono text-purple-500/80 bg-black/50 px-1 rounded">RIGHT DOCK</span>
      </div>
      {/* Render children (like CommandConsole) */}
      {children}
      
      {/* Portal target for docked panels */}
      <div id="dock-right-portal" className="flex flex-col gap-2 shrink-0" />
    </div>
  )
}

/**
 * Top Bar - for orbit parameters, pass timeline
 */
export function TopDockBar({ children }) {
  const { highlightedZone } = useDocking()
  const isHighlighted = highlightedZone === 'top'
  
  return (
    <div 
      className={cn(
        "h-auto border-b border-border bg-card/30 backdrop-blur-sm transition-all duration-200",
        isHighlighted && "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
      )}
    >
      {children}
    </div>
  )
}

/**
 * DockContainerLayout - Main layout with all dock containers
 * Grid is always visible and locked - no bottom dock bar
 */
export function DockContainerLayout({ children, leftContent, rightContent, topContent, leftDockedPanels, rightDockedPanels }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Dock Bar (optional) */}
      {topContent && <TopDockBar>{topContent}</TopDockBar>}
      
      {/* Middle section with columns - FIXED GRID LAYOUT */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column - Always visible with border */}
        <LeftDockColumn dockedPanels={leftDockedPanels}>
          {leftContent}
        </LeftDockColumn>
        
        {/* Center Content (3D/2D View) - Locked in grid, always visible, fills available space */}
        <div className="flex-1 min-w-0 relative flex items-center justify-center bg-background/50 border-l border-r border-border overflow-hidden">
          <div className="w-full h-full p-2">
            {children}
          </div>
        </div>
        
        {/* Right Column - Always visible with border */}
        <RightDockColumn dockedPanels={rightDockedPanels}>
          {rightContent}
        </RightDockColumn>
      </div>
    </div>
  )
}

export default DockContainerLayout
