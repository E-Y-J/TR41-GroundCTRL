/**
 * OrbitalViewPanel - Orbital telemetry display panel
 * 
 * Shows real-time orbital parameters including altitude, inclination,
 * latitude, longitude, velocity, and period.
 * 
 * Supports docking to designated zones or floating freely.
 */

import { useDocking } from "@/contexts/DockingContext"
import { DraggablePanel } from "../DraggablePanel"
import { Satellite } from "lucide-react"

export function OrbitalViewPanel({ telemetry, onClose }) {
  const { dockedPanels } = useDocking()
  const isDocked = dockedPanels['orbital-view']?.docked

  // Extract orbital data from telemetry
  // Support both flat structure (lat/lon/alt) and nested structure (orbit.latitude/longitude/altitude_km)
  const altitude = telemetry?.orbit?.altitude_km || telemetry?.alt || 0
  const inclination = telemetry?.orbit?.inclination_degrees || 0
  const latitude = telemetry?.orbit?.latitude || telemetry?.lat || 0
  const longitude = telemetry?.orbit?.longitude || telemetry?.lon || 0
  const velocity = telemetry?.orbit?.velocity_km_s || 0
  const period = telemetry?.orbit?.period_minutes || 93 // ~93 min for LEO

  const content = (
    <div className="space-y-3">
      {/* Orbital Parameters Section */}
      <div className="space-y-2">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
          Orbital Parameters
        </div>
        
        <InfoRow label="Altitude" value={`${altitude.toFixed(1)} km`} />
        <InfoRow label="Inclination" value={`${inclination.toFixed(2)}°`} />
        <InfoRow label="Velocity" value={`${velocity.toFixed(2)} km/s`} />
        <InfoRow label="Period" value={`${period.toFixed(1)} min`} />
      </div>

      {/* Current Position Section */}
      <div className="pt-2 border-t border-border space-y-2">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
          Current Position
        </div>
        
        <InfoRow label="Latitude" value={formatLatitude(latitude)} />
        <InfoRow label="Longitude" value={formatLongitude(longitude)} />
      </div>

      {/* Status Indicator */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Tracking Active</span>
        </div>
      </div>
    </div>
  )

  if (isDocked) {
    return (
      <div className="h-full bg-card border border-border rounded-lg p-3 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Orbital View</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {content}
      </div>
    )
  }

  return (
    <DraggablePanel
      id="orbital-view"
      title="Orbital View"
      icon={<Satellite className="w-4 h-4" />}
      defaultPosition={{ x: 20, y: 80 }}
      defaultSize={{ width: 280, height: 340 }}
      onClose={onClose}
    >
      {content}
    </DraggablePanel>
  )
}

/** Single info row component */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono text-foreground">{value}</span>
    </div>
  )
}

/** Format latitude with hemisphere indicator */
function formatLatitude(lat) {
  const dir = lat >= 0 ? "N" : "S"
  return `${Math.abs(lat).toFixed(2)}° ${dir}`
}

/** Format longitude with hemisphere indicator */
function formatLongitude(lon) {
  const dir = lon >= 0 ? "E" : "W"
  return `${Math.abs(lon).toFixed(2)}° ${dir}`
}

export default OrbitalViewPanel
