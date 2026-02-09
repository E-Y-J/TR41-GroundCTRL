/**
 * DockContainer - Visible background columns/rows for docking panels
 * 
 * These are the permanent visible containers that panels dock into.
 * Based on the wireframe design with left column, right column, top bar, bottom bar.
 */

/**
 * Left Column - for HUD panels
 */
export function LeftDockColumn({ children, dockedPanels = [] }) {
  return (
    <div className="w-[320px] border-r border-border bg-card/30 backdrop-blur-sm flex flex-col gap-2 p-2 overflow-hidden">
      {/* Render children directly - no scrolling */}
      {children}
    </div>
  )
}

/**
 * Right Column - for HUD panels
 */
export function RightDockColumn({ children, dockedPanels = [] }) {
  return (
    <div className="w-[380px] border-l border-border bg-card/30 backdrop-blur-sm flex flex-col gap-2 p-2 overflow-hidden">
      {/* Render children directly - no scrolling */}
      {children}
    </div>
  )
}

/**
 * Top Dock Bar - for orbital data, mission stats above center visualization only
 * Neutral color to match background
 */
export function TopDockBar({ children }) {
  return (
    <div className="h-[80px] border-b border-border bg-muted/30 backdrop-blur-sm p-2 flex items-center gap-4">
      {children || (
        <div className="w-full text-center text-xs text-muted-foreground/60">
          Top HUD Area - Orbital Data & Mission Stats
        </div>
      )}
    </div>
  )
}

/**
 * DockContainerLayout - Main layout with all dock containers
 * Grid is always visible and locked - NASA-style fixed layout
 */
export function DockContainerLayout({ children, leftPanels, rightPanels, topContent }) {
  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Left Column - Always visible, full height, subsystem monitoring */}
      <LeftDockColumn>
        {leftPanels}
      </LeftDockColumn>
      
      {/* Center Column with Top Dock and Visualization */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Dock Bar - only above center visualization */}
        {topContent && <TopDockBar>{topContent}</TopDockBar>}
        
        {/* Center Content (3D/2D View) - fills remaining space */}
        <div className="flex-1 relative bg-background/50 overflow-hidden">
          {children}
        </div>
      </div>
      
      {/* Right Column - Always visible, full height, comms and control */}
      <RightDockColumn>
        {rightPanels}
      </RightDockColumn>
    </div>
  )
}

export default DockContainerLayout
