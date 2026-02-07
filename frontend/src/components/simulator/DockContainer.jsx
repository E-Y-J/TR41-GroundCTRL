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
        "w-[320px] border-r border-border bg-card/30 backdrop-blur-sm flex flex-col transition-all duration-200",
        isHighlighted && "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
      )}
    >
      {/* Render children (like NOVA) */}
      {children}
      
      {/* Render docked panels inline */}
      {dockedPanels.map((panel) => (
        <div key={panel.panelId} className="w-full">
          {panel.content}
        </div>
      ))}
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
        "w-[320px] border-l border-border bg-card/30 backdrop-blur-sm flex flex-col transition-all duration-200",
        isHighlighted && "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
      )}
    >
      {/* Render children (like CommandConsole) */}
      {children}
      
      {/* Render docked panels inline */}
      {dockedPanels.map((panel) => (
        <div key={panel.panelId} className="w-full">
          {panel.content}
        </div>
      ))}
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
 * Bottom Bar - for resource monitoring
 */
export function BottomDockBar({ children }) {
  const { highlightedZone } = useDocking()
  const isHighlighted = highlightedZone === 'bottom'
  
  return (
    <div 
      className={cn(
        "h-auto border-t border-border bg-card/30 backdrop-blur-sm transition-all duration-200",
        isHighlighted && "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
      )}
    >
      {children}
    </div>
  )
}

/**
 * DockContainerLayout - Main layout with all dock containers
 */
export function DockContainerLayout({ children, leftContent, rightContent, topContent, bottomContent, leftDockedPanels, rightDockedPanels }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Dock Bar */}
      {topContent && <TopDockBar>{topContent}</TopDockBar>}
      
      {/* Middle section with columns */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column */}
        {leftContent && (
          <LeftDockColumn dockedPanels={leftDockedPanels}>
            {leftContent}
          </LeftDockColumn>
        )}
        
        {/* Center Content (3D/2D View) */}
        <div className="flex-1 min-w-0 relative">
          {children}
        </div>
        
        {/* Right Column */}
        {rightContent && (
          <RightDockColumn dockedPanels={rightDockedPanels}>
            {rightContent}
          </RightDockColumn>
        )}
      </div>
      
      {/* Bottom Dock Bar */}
      {bottomContent && <BottomDockBar>{bottomContent}</BottomDockBar>}
    </div>
  )
}

export default DockContainerLayout
