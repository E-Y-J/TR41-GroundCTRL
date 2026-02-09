/**
 * DockContainer - Visible background columns/rows for docking panels
 * 
 * These are the permanent visible containers that panels dock into.
 * Based on the wireframe design with left column, right column, top bar, bottom bar.
 */

/**
 * Left Column - for NOVA, ADCS, EPS panels
 */
export function LeftDockColumn({ children, dockedPanels = [] }) {
  return (
    <div className="w-[320px] border-r border-border bg-card/30 backdrop-blur-sm flex flex-col gap-2">
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
  return (
    <div className="w-[320px] border-l border-border bg-card/30 backdrop-blur-sm flex flex-col gap-2">
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
  return (
    <div className="h-auto border-b border-border bg-card/30 backdrop-blur-sm">
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
