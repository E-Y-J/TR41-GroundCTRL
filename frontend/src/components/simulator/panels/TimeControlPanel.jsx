/**
 * TimeControlPanel - Draggable time control panel
 * 
 * Allows users to control simulation time speed
 */

import { DraggablePanel } from '../DraggablePanel'
import { TimeControlDisplay } from '../time-control-display'
import { Clock } from 'lucide-react'

export function TimeControlPanel({ sessionId, onClose, telemetry, status = 'nominal' }) {
  return (
    <DraggablePanel
      id="time-control-panel"
      title="Time Control"
      defaultPosition={{ x: window.innerWidth - 500, y: 100, width: 380, height: 180 }}
      minWidth={320}
      minHeight={150}
      onClose={onClose}
      enableDocking={true}
      dockType="control"
    >
      <div className="space-y-4">
        {/* Time Control Display */}
        <TimeControlDisplay 
          sessionId={sessionId}
          className="w-full"
        />
        
        {/* Info */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Control simulation time flow. Use higher speeds to fast-forward through orbital passes 
                and slower speeds for precise maneuvers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DraggablePanel>
  )
}

export default TimeControlPanel
