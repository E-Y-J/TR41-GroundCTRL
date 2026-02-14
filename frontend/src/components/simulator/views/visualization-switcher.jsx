import { useState, lazy, Suspense } from "react"
import { GroundTrack2D } from "./ground-track-2d"
import { GlobeToMap } from "../../globe-to-map"

// Lazy load the heavy 3D component to reduce initial bundle size
const EarthGlobe3D = lazy(() => import("./earth-globe-3d").then(module => ({ default: module.EarthGlobe3D })))

// ============================================================================
// Sub-Components
// ============================================================================

/** Loading component for lazy-loaded views */
function ViewLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm text-muted-foreground">Loading visualization...</span>
      </div>
    </div>
  )
}

/** View mode toggle button */
function ViewToggle({
  mode,
  onToggle
}) {
  return (
    <button
      onClick={onToggle}
      className="absolute left-3 bottom-3 bg-card/95 backdrop-blur border border-border rounded-lg px-2.5 py-1.5 shadow-lg z-30 hover:bg-accent transition-colors"
      aria-label={`Switch to next view mode`}
    >
      <div className="flex items-center gap-2">
        <ViewIcon mode={mode} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {mode === "2d" ? "2D Map" : mode === "3d" ? "3D Globe" : "Morph Mode"}
        </span>
      </div>
    </button>
  )
}

/** View mode icon */
function ViewIcon({ mode }) {
  if (mode === "2d") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 text-muted-foreground"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      </svg>
    )
  }

  if (mode === "3d") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 text-muted-foreground"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    )
  }

  return (
    <div className="flex items-center">
      <div className="w-2 h-2 rounded-full border border-primary mr-[1px]" />
      <div className="w-1.5 h-1 border-t border-b border-primary" />
      <div className="w-2 h-1 border border-primary" />
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function VisualizationSwitcher({
  telemetry,
  altitude = 415,
  inclination = 51.6,
  eccentricity = 0.0001,
  raan = 0,
  mode = "2d",
  onModeChange,
  defaultView = "2d",
  showToggle = true,
  groundStationsData = null, // WebSocket ground stations data
  className = "",
}) {
  // Support both controlled (mode + onModeChange) and uncontrolled (defaultView) usage
  const [internalMode, setInternalMode] = useState(defaultView)
  const viewMode = mode || internalMode
  const handleModeChange = onModeChange || setInternalMode

  const toggleView = () => {
    // Cycle through: 2D -> 3D -> TRANSFORM -> 2D
    let newMode = "2d"
    if (viewMode === "2d") newMode = "3d"
    else if (viewMode === "3d") newMode = "transform"

    handleModeChange(newMode)
  }

  // Prep satellite data for GlobeToMap component
  const satellites = telemetry?.orbit ? [{
    id: 'current',
    name: 'SAT-01',
    latitude: telemetry.orbit.latitude || 0,
    longitude: telemetry.orbit.longitude || 0,
    altitude: telemetry.orbit.altitude || telemetry.orbit.altitude_km || 408
  }] : []

  return (
    <div className={`relative w-full h-full ${className}`}>
      {viewMode === "2d" && (
        <GroundTrack2D
          telemetry={telemetry}
          altitude={altitude}
          inclination={inclination}
          showFootprint={true}
          showGroundStations={true}
          showPredictions={true}
          className="w-full h-full"
        />
      )}

      {viewMode === "3d" && (
        <Suspense fallback={<ViewLoader />}>
          <EarthGlobe3D
            telemetry={telemetry}
            altitude={altitude}
            inclination={inclination}
            eccentricity={eccentricity}
            raan={raan}
            showOrbit={true}
            showAtmosphere={true}
            showStars={true}
            showGroundStations={true}
            showVisibilityCones={true}
            showCommLinks={true}
            showLabels={true}
            showOrbitalNodes={false}
            animationSpeed={120}
            groundStationsData={groundStationsData}
            className="w-full h-full"
          />
        </Suspense>
      )}

      {viewMode === "transform" && (
        <GlobeToMap
          satellites={satellites}
          className="w-full h-full"
        />
      )}

      {showToggle && (
        <ViewToggle mode={viewMode} onToggle={toggleView} />
      )}
    </div>
  )
}

export default VisualizationSwitcher
