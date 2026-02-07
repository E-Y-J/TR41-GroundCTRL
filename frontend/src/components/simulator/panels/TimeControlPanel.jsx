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
      <div>
        {/* Time Control Display */}
        <TimeControlDisplay 
          sessionId={sessionId}
          className="w-full"
        />
      </div>
    </DraggablePanel>
  )
}

export default TimeControlPanel
