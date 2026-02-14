import { useState, useEffect, lazy, Suspense, useRef } from "react"
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
    <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-sm text-muted-foreground">Loading 3D Engine...</span>
      </div>
    </div>
  )
}

/** View mode toggle button */
function ViewToggle({
  mode,
  isTransitioning,
  onToggle
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isTransitioning}
      className={`absolute left-3 bottom-3 bg-card/95 backdrop-blur border border-border rounded-lg px-3 py-2 shadow-lg z-50 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'hover:bg-accent hover:border-primary/50'}`}
      aria-label={`Switch to ${mode === "2d" ? "3D" : "2D"} view`}
    >
      <div className="flex items-center gap-3">
        <ViewIcon mode={mode} />
        <div className="flex flex-col items-start translate-y-[-1px]">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">
            Visual Mode
          </span>
          <span className="text-xs font-semibold text-foreground leading-none">
            {isTransitioning ? "Establishing Link..." : mode === "2d" ? "2D Equirectangular" : "3D Celestial"}
          </span>
        </div>
      </div>
    </button>
  )
}

/** View mode icon */
function ViewIcon({ mode }) {
  if (mode === "2d") {
    return (
      <div className="relative w-5 h-5 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-primary"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-primary"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * VisualizationSwitcher - Unified view controller with seamless morphing transition
 */
export function VisualizationSwitcher({
  telemetry,
  altitude = 415,
  inclination = 51.6,
  eccentricity = 0.0001,
  raan = 0,
  mode = undefined, // controlled
  onModeChange,
  defaultView = "2d",
  showToggle = true,
  groundStationsData = null, // WebSocket ground stations data
  className = "",
}) {
  const [internalMode, setInternalMode] = useState(defaultView)
  const viewMode = mode || internalMode
  const handleModeChange = onModeChange || setInternalMode

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [morphProgress, setMorphProgress] = useState(viewMode === "2d" ? 100 : 0)
  const previousModeRef = useRef(viewMode)

  // Handle seamless transition when mode changes
  useEffect(() => {
    if (viewMode !== previousModeRef.current) {
      const startValue = viewMode === "2d" ? 0 : 100 // We are coming FROM the other mode
      const endValue = viewMode === "2d" ? 100 : 0  // We are going TO this mode

      setIsTransitioning(true)

      let startTime = null
      const duration = 1500

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function: easeInOutCubic
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

        setMorphProgress(startValue + (endValue - startValue) * eased)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsTransitioning(false)
          previousModeRef.current = viewMode
        }
      }

      requestAnimationFrame(animate)
    }
  }, [viewMode])

  const toggleView = () => {
    if (isTransitioning) return
    const nextMode = viewMode === "2d" ? "3d" : "2d"
    handleModeChange(nextMode)
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
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 ${className}`}>
      {/* 
        LAYER 1: The Base Visualization (2D or 3D) 
        We show them stacked during transition for a cross-fade effect
      */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${viewMode === "2d" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <GroundTrack2D
          telemetry={telemetry}
          altitude={altitude}
          inclination={inclination}
          showFootprint={true}
          showGroundStations={true}
          showPredictions={true}
          className="w-full h-full"
        />
      </div>

      <div className={`absolute inset-0 transition-opacity duration-700 ${viewMode === "3d" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
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
      </div>

      {/* 
        LAYER 2: The Morphing Lens (D3 Overlay) 
        This layer provides the seamless transition grid and country outlines
      */}
      <div className={`absolute inset-0 pointer-events-none z-20`}>
        <GlobeToMap
          satellites={satellites}
          progress={morphProgress}
          showUI={false} // We handle our own UI
          showCountries={true}
          opacity={isTransitioning ? 0.8 : (viewMode === "2d" ? 0.4 : 0)}
          className="w-full h-full"
        />
      </div>

      {/* 
        LAYER 3: Interface Toggles
      */}
      {showToggle && (
        <ViewToggle
          mode={viewMode}
          isTransitioning={isTransitioning}
          onToggle={toggleView}
        />
      )}

      {/* Transition Overlay (Digital Glitch/Flash) */}
      {isTransitioning && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-primary/5 animate-pulse flex items-center justify-center">
          <div className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.5em] animate-pulse">
            Recalibrating Projections...
          </div>
        </div>
      )}
    </div>
  )
}

export default VisualizationSwitcher
